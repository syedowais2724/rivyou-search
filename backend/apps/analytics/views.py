from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from drf_spectacular.utils import extend_schema, OpenApiTypes

from .models import SearchHistory
from .serializers import SearchHistorySerializer

class UserSearchHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: SearchHistorySerializer(many=True)}
    )
    def get(self, request):
        # Return current user's past 50 search queries
        histories = SearchHistory.objects.filter(user=request.user).order_by('-searched_at')[:50]
        serializer = SearchHistorySerializer(histories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TopSearchesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT}
    )
    def get(self, request):
        # Return top 10 most searched queries across all users
        # Case-insensitive grouping can be done by lowering or using raw value.
        # Direct field grouping is fast and clean.
        top_queries = (
            SearchHistory.objects.values('query')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        return Response(list(top_queries), status=status.HTTP_200_OK)
