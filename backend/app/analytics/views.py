# app/analytics/views.py

import csv
import json
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from django.utils.dateparse import parse_date
from datetime import timedelta, datetime

from .models import (
    APIAccessLog, UserAction, DailyStatistics,
    UserStatistics, PopularContent
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_api_logs(request):
    """获取API访问日志列表,支持多种过滤条件"""
    # 获取查询参数
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    user_id = request.query_params.get('user_id')
    path = request.query_params.get('path')
    method = request.query_params.get('method')
    status_code = request.query_params.get('status_code')
    ip_address = request.query_params.get('ip_address')
    
    # 构建查询
    queryset = APIAccessLog.objects.all()
    
    # 应用过滤条件
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            queryset = queryset.filter(timestamp__gte=start_datetime)
        except ValueError:
            return Response({"error": "无效的开始日期格式,请使用YYYY-MM-DD格式"}, status=400)
    
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            queryset = queryset.filter(timestamp__lte=end_datetime)
        except ValueError:
            return Response({"error": "无效的结束日期格式,请使用YYYY-MM-DD格式"}, status=400)
    
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    
    if path:
        queryset = queryset.filter(path__icontains=path)
    
    if method:
        queryset = queryset.filter(method=method.upper())
    
    if status_code:
        queryset = queryset.filter(status_code=status_code)
    
    if ip_address:
        queryset = queryset.filter(ip_address=ip_address)
    
    # 排序
    queryset = queryset.order_by('-timestamp')
    
    # 分页
    paginator = StandardResultsSetPagination()
    result_page = paginator.paginate_queryset(queryset, request)
    
    # 序列化结果
    data = [{
        'id': log.id,
        'user': log.user.username if log.user else None,
        'user_id': log.user.id if log.user else None,
        'ip_address': log.ip_address,
        'method': log.method,
        'path': log.path,
        'status_code': log.status_code,
        'response_time': log.response_time,
        'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'user_agent': log.user_agent,
    } for log in result_page]
    
    return paginator.get_paginated_response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_api_log_detail(request, log_id):
    """获取单个API访问日志的详细信息"""
    try:
        log = APIAccessLog.objects.get(id=log_id)
    except APIAccessLog.DoesNotExist:
        return Response({"error": "日志不存在"}, status=404)
    
    data = {
        'id': log.id,
        'user': log.user.username if log.user else None,
        'user_id': log.user.id if log.user else None,
        'ip_address': log.ip_address,
        'method': log.method,
        'path': log.path,
        'status_code': log.status_code,
        'response_time': log.response_time,
        'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'user_agent': log.user_agent,
        'request_data': log.request_data
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_api_logs(request):
    """导出API访问日志为CSV格式"""
    # 获取查询参数,与get_api_logs相同的过滤逻辑
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    user_id = request.query_params.get('user_id')
    path = request.query_params.get('path')
    method = request.query_params.get('method')
    status_code = request.query_params.get('status_code')
    ip_address = request.query_params.get('ip_address')
    
    # 构建查询
    queryset = APIAccessLog.objects.all()
    
    # 应用过滤条件
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            queryset = queryset.filter(timestamp__gte=start_datetime)
        except ValueError:
            return Response({"error": "无效的开始日期格式,请使用YYYY-MM-DD格式"}, status=400)
    
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            queryset = queryset.filter(timestamp__lte=end_datetime)
        except ValueError:
            return Response({"error": "无效的结束日期格式,请使用YYYY-MM-DD格式"}, status=400)
    
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    
    if path:
        queryset = queryset.filter(path__icontains=path)
    
    if method:
        queryset = queryset.filter(method=method.upper())
    
    if status_code:
        queryset = queryset.filter(status_code=status_code)
    
    if ip_address:
        queryset = queryset.filter(ip_address=ip_address)
    
    # 排序
    queryset = queryset.order_by('-timestamp')
    
    # 创建CSV响应
    response = HttpResponse(content_type='text/csv')
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    response['Content-Disposition'] = f'attachment; filename="api_logs_{timestamp}.csv"'
    
    # 写入CSV头和数据
    writer = csv.writer(response)
    writer.writerow(['ID', '用户', '用户ID', 'IP地址', '请求方法', '访问路径', '状态码', '响应时间(ms)', '访问时间', '用户代理'])
    
    for log in queryset:
        writer.writerow([
            log.id,
            log.user.username if log.user else '匿名用户',
            log.user.id if log.user else '',
            log.ip_address,
            log.method,
            log.path,
            log.status_code,
            log.response_time,
            log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            log.user_agent
        ])
    
    return response

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_api_logs_json(request):
    """导出API访问日志为JSON格式"""
    # 获取查询参数,与get_api_logs相同的过滤逻辑
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    user_id = request.query_params.get('user_id')
    path = request.query_params.get('path')
    method = request.query_params.get('method')
    status_code = request.query_params.get('status_code')
    ip_address = request.query_params.get('ip_address')
    
    # 构建查询
    queryset = APIAccessLog.objects.all()
    
    # 应用过滤条件 (与CSV导出相同)
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            queryset = queryset.filter(timestamp__gte=start_datetime)
        except ValueError:
            return Response({"error": "无效的开始日期格式,请使用YYYY-MM-DD格式"}, status=400)
    
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            queryset = queryset.filter(timestamp__lte=end_datetime)
        except ValueError:
            return Response({"error": "无效的结束日期格式,请使用YYYY-MM-DD格式"}, status=400)
    
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    
    if path:
        queryset = queryset.filter(path__icontains=path)
    
    if method:
        queryset = queryset.filter(method=method.upper())
    
    if status_code:
        queryset = queryset.filter(status_code=status_code)
    
    if ip_address:
        queryset = queryset.filter(ip_address=ip_address)
    
    # 排序
    queryset = queryset.order_by('-timestamp')
    
    # 准备JSON数据
    data = [{
        'id': log.id,
        'user': log.user.username if log.user else None,
        'user_id': log.user.id if log.user else None,
        'ip_address': log.ip_address,
        'method': log.method,
        'path': log.path,
        'status_code': log.status_code,
        'response_time': log.response_time,
        'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'user_agent': log.user_agent,
        'request_data': log.request_data
    } for log in queryset]
    
    # 创建JSON响应
    response = HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    response['Content-Disposition'] = f'attachment; filename="api_logs_{timestamp}.json"'
    
    return response

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_api_log_statistics(request):
    """获取API访问日志的统计信息"""
    # 获取时间范围
    days = request.query_params.get('days', 7)
    try:
        days = int(days)
        if days <= 0:
            days = 7
    except ValueError:
        days = 7
    
    start_date = timezone.now() - timedelta(days=days)
    
    # 获取总体统计
    total_logs = APIAccessLog.objects.filter(timestamp__gte=start_date).count()
    success_logs = APIAccessLog.objects.filter(timestamp__gte=start_date, status_code__lt=400).count()
    error_logs = APIAccessLog.objects.filter(timestamp__gte=start_date, status_code__gte=400).count()
    avg_response_time = APIAccessLog.objects.filter(timestamp__gte=start_date).aggregate(avg=Avg('response_time'))['avg'] or 0
    
    # 按路径统计
    path_stats = APIAccessLog.objects.filter(timestamp__gte=start_date).values('path').annotate(
        count=Count('id'),
        success=Count('id', filter=Q(status_code__lt=400)),
        error=Count('id', filter=Q(status_code__gte=400)),
        avg_time=Avg('response_time')
    ).order_by('-count')[:10]
    
    # 按方法统计
    method_stats = APIAccessLog.objects.filter(timestamp__gte=start_date).values('method').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # 按状态码统计
    status_stats = APIAccessLog.objects.filter(timestamp__gte=start_date).values('status_code').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # 按用户统计
    user_stats = APIAccessLog.objects.filter(timestamp__gte=start_date).exclude(user=None).values(
        'user__username', 'user__id'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # 按日期统计
    date_stats = APIAccessLog.objects.filter(timestamp__gte=start_date).extra({
        'date': "DATE(timestamp)"
    }).values('date').annotate(
        count=Count('id'),
        success=Count('id', filter=Q(status_code__lt=400)),
        error=Count('id', filter=Q(status_code__gte=400)),
        avg_time=Avg('response_time')
    ).order_by('date')
    
    return Response({
        'total_logs': total_logs,
        'success_rate': (success_logs / total_logs * 100) if total_logs > 0 else 0,
        'error_rate': (error_logs / total_logs * 100) if total_logs > 0 else 0,
        'avg_response_time': avg_response_time,
        'path_stats': path_stats,
        'method_stats': method_stats,
        'status_stats': status_stats,
        'user_stats': user_stats,
        'date_stats': date_stats
    })

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
        error_count=Count('id', filter=Q(status_code__gte=400))
    )

    # 获取热门内容
    popular_content = PopularContent.objects.order_by('-score')[:5]

    # 获取最近的API错误
    recent_errors = APIAccessLog.objects.filter(
        status_code__gte=400
    ).order_by('-timestamp')[:5].values(
        'id', 'path', 'method', 'status_code', 'timestamp', 'ip_address'
    )

    return Response({
        'today_stats': today_stats,
        'api_stats': api_stats,
        'popular_content': popular_content.values(),
        'recent_errors': recent_errors
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