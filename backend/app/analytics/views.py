# app/analytics/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import (
    APIAccessLog, UserAction, DailyStatistics,
    UserStatistics, PopularContent
)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_dashboard_stats(request):
    """获取仪表盘统计数据"""
    today = timezone.now().date()
    last_week = today - timedelta(days=7)

    # 获取今日统计
    today_stats = DailyStatistics.objects.filter(date=today).first()

    # 获取API访问统计
    api_stats = APIAccessLog.objects.filter(
        timestamp__date__gte=last_week
    ).aggregate(
        total_calls=Count('id'),
        avg_response_time=Avg('response_time'),
        error_count=Count('id', filter={'status_code__gte': 400})
    )

    # 获取热门内容
    popular_content = PopularContent.objects.order_by('-score')[:5]

    return Response({
        'today_stats': today_stats,
        'api_stats': api_stats,
        'popular_content': popular_content.values()
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_user_behavior_stats(request):
    """获取用户行为统计"""
    last_30_days = timezone.now() - timedelta(days=30)

    user_actions = UserAction.objects.filter(
        timestamp__gte=last_30_days
    ).values('action_type').annotate(
        count=Count('id')
    )

    return Response({
        'user_actions': user_actions,
        'top_users': UserStatistics.objects.order_by(
            '-active_days'
        )[:10].values('user__username', 'active_days', 'total_articles')
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_api_performance(request):
    """获取API性能统计"""
    api_stats = APIAccessLog.objects.values('path').annotate(
        total_calls=Count('id'),
        avg_response_time=Avg('response_time'),
        error_rate=Count('id', filter={'status_code__gte': 400}) * 100.0 / Count('id')
    ).order_by('-total_calls')

    return Response(api_stats)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_content_analytics(request):
    """获取内容统计"""
    return Response({
        'popular_content': PopularContent.objects.order_by('-score')[:20].values(),
        'daily_stats': DailyStatistics.objects.order_by('-date')[:30].values()
    })

@api_view(['GET'])
def get_user_stats(request):
    """获取用户个人统计数据"""
    if not request.user.is_authenticated:
        return Response({"error": "需要登录"}, status=401)

    stats = UserStatistics.objects.get(user=request.user)
    user_actions = UserAction.objects.filter(
        user=request.user
    ).values('action_type').annotate(
        count=Count('id')
    )

    return Response({
        'stats': {
            'total_articles': stats.total_articles,
            'total_views': stats.total_article_views,
            'total_likes': stats.total_article_likes,
            'active_days': stats.active_days
        },
        'recent_actions': user_actions
    })