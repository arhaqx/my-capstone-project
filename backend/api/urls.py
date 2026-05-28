from django.urls import path
from .views import HomeView, PredictMultiView, HistoryView, NewsView, ChatView
from .admin_views import (
    AdminDashboardStatsView, AdminUserListView, AdminUserDetailView,
    AdminHistoryListView, AdminSevereDetectionView, AdminArticleListView, AdminArticleDetailView
)

urlpatterns = [
    path('', HomeView.as_view()),
    path('predict-multi/', PredictMultiView.as_view()),
    path('history/', HistoryView.as_view()),
    path('history/<int:id>/', HistoryView.as_view()),
    path('news/', NewsView.as_view()),
    
    # Admin Routes
    path('admin/dashboard/', AdminDashboardStatsView.as_view()),
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view()),
    path('admin/history/', AdminHistoryListView.as_view()),
    path('admin/severe-detection/', AdminSevereDetectionView.as_view()),
    path('admin/articles/', AdminArticleListView.as_view()),
    path('admin/articles/<int:pk>/', AdminArticleDetailView.as_view()),
    
    path('chat/', ChatView.as_view()),
]
