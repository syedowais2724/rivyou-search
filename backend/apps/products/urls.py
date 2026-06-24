from django.urls import path
from .views import ProductCreateView, ProductSearchView, ProductDetailView, ProductCategoryView

urlpatterns = [
    path('', ProductCreateView.as_view(), name='product-create'),
    path('search', ProductSearchView.as_view(), name='product-search'),
    path('<int:pk>', ProductDetailView.as_view(), name='product-detail'),
    path('category/<str:category>', ProductCategoryView.as_view(), name='product-category'),
]
