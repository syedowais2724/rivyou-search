import math
from django.core.cache import cache
from rest_framework import status, permissions, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from rapidfuzz import fuzz
import django_rq

from .models import Product
from .serializers import ProductSerializer
from .search import search_products

def safe_enqueue_log(user_id, query, results_count):
    try:
        django_rq.enqueue(
            'apps.analytics.tasks.log_search_query',
            user_id=user_id,
            query=query,
            results_count=results_count
        )
    except Exception:
        try:
            from apps.analytics.tasks import log_search_query
            log_search_query(user_id=user_id, query=query, results_count=results_count)
        except Exception:
            pass

def get_query_suggestion(query):
    """
    Suggests a correction if a fuzzy match is detected and is close to predefined categories/tags.
    """
    query_lower = query.strip().lower()
    if not query_lower:
        return None
    
    # Predefined targets based on dataset schema
    targets = [
        "smartphone", "smartphones", "charger", "chargers", "back cover", "back covers",
        "5g", "camera", "performance", "battery", "flagship",
        "fast-charging", "portable", "usb-c", "wireless",
        "protective", "slim", "matte", "transparent"
    ]
    
    # If query is exactly a target, no correction suggestion needed
    if query_lower in targets:
        return None
        
    best_target = None
    best_score = 0
    for target in targets:
        score = fuzz.ratio(query_lower, target)
        if score > 80 and score > best_score:
            best_score = score
            best_target = target
            
    if best_target in ["smartphones", "smartphone"]:
        return "smartphone"
    elif best_target in ["chargers", "charger"]:
        return "charger"
    elif best_target in ["back covers", "back cover"]:
        return "back cover"
        
    return best_target


class ProductSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter('q', OpenApiTypes.STR, required=True, description='Search query term'),
            OpenApiParameter('limit', OpenApiTypes.INT, default=20, description='Items per page'),
            OpenApiParameter('page', OpenApiTypes.INT, default=1, description='Page number'),
            OpenApiParameter('category_filter', OpenApiTypes.STR, required=False, description='Optional category filter'),
        ],
        responses={200: OpenApiTypes.OBJECT}
    )
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response(
                {"error": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        category_filter = request.query_params.get('category_filter', '').strip() or None
        
        try:
            limit = int(request.query_params.get('limit', 20))
            page = int(request.query_params.get('page', 1))
        except ValueError:
            return Response(
                {"error": "Limit and page must be integers."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if limit <= 0 or page <= 0:
            return Response(
                {"error": "Limit and page must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Caching check
        cache_key = f"search:{query}:{page}:{limit}:{category_filter or ''}"
        cached_response = cache.get(cache_key)
        if cached_response:
            # Enqueue query logging asynchronously anyway (even if cache hit)
            # Fetch results count from cached response
            results_count = cached_response.get("total_results", 0)
            safe_enqueue_log(request.user.id, query, results_count)
            return Response(cached_response, status=status.HTTP_200_OK)

        # Execute search algorithm
        all_results = search_products(query, category_filter)
        total_results = len(all_results)
        
        # Calculate pagination
        total_pages = math.ceil(total_results / limit) if total_results > 0 else 1
        
        # Slice results
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_results = all_results[start_idx:end_idx]
        
        # Check fuzzy spelling correction
        suggested_query = get_query_suggestion(query)
        
        response_data = {
            "query": query,
            "suggested_query": suggested_query,
            "total_results": total_results,
            "page": page,
            "total_pages": total_pages,
            "results": paginated_results
        }
        
        # Set cache with 5-minute TTL (300 seconds)
        cache.set(cache_key, response_data, timeout=300)
        
        # Enqueue logging to SearchHistory model via Django-RQ (falls back to sync db write if Redis is down)
        safe_enqueue_log(request.user.id, query, total_results)
        
        return Response(response_data, status=status.HTTP_200_OK)


class ProductDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


class ProductCategoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter('limit', OpenApiTypes.INT, default=20),
            OpenApiParameter('page', OpenApiTypes.INT, default=1),
        ],
        responses={200: OpenApiTypes.OBJECT}
    )
    def get(self, request, category):
        try:
            limit = int(request.query_params.get('limit', 20))
            page = int(request.query_params.get('page', 1))
        except ValueError:
            return Response({"error": "Limit and page must be integers"}, status=status.HTTP_400_BAD_REQUEST)

        # category matching is case-insensitive
        products = Product.objects.filter(category__iexact=category).order_index = ['id']
        # Note: we can sort by id to ensure stable pagination
        products = Product.objects.filter(category__iexact=category).order_by('id')
        total_results = products.count()
        
        total_pages = math.ceil(total_results / limit) if total_results > 0 else 1
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated_products = products[start_idx:end_idx]
        serializer = ProductSerializer(paginated_products, many=True)
        
        return Response({
            "category": category,
            "total_results": total_results,
            "page": page,
            "total_pages": total_pages,
            "results": serializer.data
        }, status=status.HTTP_200_OK)


class ProductCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    class CreateProductSerializer(serializers.Serializer):
        product_name = serializers.CharField(max_length=255)
        description = serializers.CharField(required=False)
        product_description = serializers.CharField(required=False)
        category = serializers.CharField(max_length=100)
        tags = serializers.ListField(child=serializers.CharField(max_length=50), default=list)

    @extend_schema(
        request=CreateProductSerializer,
        responses={201: ProductSerializer}
    )
    def post(self, request):
        serializer = self.CreateProductSerializer(data=request.data)
        if serializer.is_valid():
            desc = serializer.validated_data.get('description') or serializer.validated_data.get('product_description') or ''
            product = Product.objects.create(
                product_name=serializer.validated_data['product_name'],
                product_description=desc,
                category=serializer.validated_data['category'],
                tags=serializer.validated_data['tags']
            )
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
