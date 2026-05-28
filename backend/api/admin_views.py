from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, F
from django.utils import timezone
from datetime import timedelta

from .models import History, Article
from .permissions import IsAdminRole, IsSuperadminRole
from .serializers import AdminUserSerializer, HistorySerializer, ArticleSerializer

User = get_user_model()

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        total_users = User.objects.count()
        total_tests = History.objects.count()
        
        # Category distribution
        category_counts = History.objects.values('category').annotate(count=Count('category'))
        categories = {item['category']: item['count'] for item in category_counts}
        
        severe_cases = History.objects.filter(category__iexact='Severe').count()

        # Recent activity (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_tests = History.objects.filter(created_at__gte=seven_days_ago) \
            .extra(select={'date': 'date(created_at)'}) \
            .values('date') \
            .annotate(count=Count('id')) \
            .order_by('date')
            
        recent_activity = [{'date': str(item['date']), 'count': item['count']} for item in recent_tests]

        # Latest users
        latest_users = User.objects.order_by('-date_joined')[:5]
        latest_users_data = AdminUserSerializer(latest_users, many=True).data

        return Response({
            "total_users": total_users,
            "total_assessments": total_tests,
            "severe_cases": severe_cases,
            "categories": categories,
            "recent_activity": recent_activity,
            "latest_users": latest_users_data
        })

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Only superadmin can edit another superadmin or change roles to superadmin
        if user.is_superadmin and not request.user.is_superadmin:
            return Response({"error": "Not allowed to edit superadmin"}, status=status.HTTP_403_FORBIDDEN)
            
        role = request.data.get('role')
        if role == 'superadmin' and not request.user.is_superadmin:
             return Response({"error": "Only superadmin can grant superadmin role"}, status=status.HTTP_403_FORBIDDEN)

        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_superadmin and not request.user.is_superadmin:
            return Response({"error": "Not allowed to delete superadmin"}, status=status.HTTP_403_FORBIDDEN)
            
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminHistoryListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        category = request.GET.get('category')
        user_id = request.GET.get('user_id')
        
        queryset = History.objects.all().order_by('-created_at')
        
        if category:
            queryset = queryset.filter(category__iexact=category)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        serializer = HistorySerializer(queryset, many=True)
        return Response(serializer.data)

class AdminSevereDetectionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Fetch severe and high moderate cases
        high_risk_cases = History.objects.filter(
            category__in=['Severe', 'Moderate']
        ).order_by('-created_at')
        
        serializer = HistorySerializer(high_risk_cases, many=True)
        return Response(serializer.data)

class AdminArticleListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        articles = Article.objects.all().order_by('-created_at')
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data['author'] = request.user.id
        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminArticleDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_object(self, pk):
        try:
            return Article.objects.get(pk=pk)
        except Article.DoesNotExist:
            return None

    def put(self, request, pk):
        article = self.get_object(pk)
        if not article:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = ArticleSerializer(article, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        article = self.get_object(pk)
        if not article:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
            
        article.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
