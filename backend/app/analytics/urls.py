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

    # 用户接口
    path('my-stats/', views.get_user_stats, name='user_stats'),
]