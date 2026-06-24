from django.urls import path
from .views import UserSearchHistoryView, TopSearchesView

urlpatterns = [
    path('search-history', UserSearchHistoryView.as_view(), name='search-history'),
    path('top-searches', TopSearchesView.as_view(), name='top-searches'),
]
