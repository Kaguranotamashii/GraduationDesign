from django.urls import path
from . import views

urlpatterns = [
    # 基础路由
    path('add/', views.add_model, name='add_model'),
    path('my/', views.get_my_models, name='get_my_models'),
    path('all/', views.get_all_models, name='get_all_models'),
    path('page/', views.get_all_buildings_paginated, name='get_all_models_page'),

    # 分类和标签
    path('categories/', views.get_building_categories, name='get_building_categories'),
    path('tags/', views.get_building_tags, name='get_building_tags'),

    # 模型文件管理
    path('upload-model/<int:pk>/', views.upload_model_file, name='upload_model_file'),
    path('delete-model/<int:pk>/', views.delete_model_file, name='delete_model_file'),
    path('update-json/<int:pk>/', views.update_model_json, name='update_model_json'),
    path('details/<int:pk>/', views.get_model_details, name='get_model_details'),
]