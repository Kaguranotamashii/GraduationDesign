# app/analytics/urls.py

from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # 管理员接口
    path('dashboard/', views.get_dashboard_stats, name='dashboard_stats'),
    path('user-behavior/', views.get_user_behavior_stats, name='user_behavior'),
    path('api-performance/', views.get_api_performance, name='api_performance'),
    path('content-analytics/', views.get_content_analytics, name='content_analytics'),
    
    # API访问日志管理接口
    path('api-logs/', views.get_api_logs, name='api_logs'),
    path('api-logs/<int:log_id>/', views.get_api_log_detail, name='api_log_detail'),
    path('api-logs/export/csv/', views.export_api_logs, name='export_api_logs_csv'),
    path('api-logs/export/json/', views.export_api_logs_json, name='export_api_logs_json'),
    path('api-logs/statistics/', views.get_api_log_statistics, name='api_log_statistics'),

    # 用户接口
    path('my-stats/', views.get_user_stats, name='user_stats'),
]