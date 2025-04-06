from django.urls import path
from . import views

urlpatterns = [
    # 基础路由
    path('add-builder/', views.add_model, name='add_model'),
    path('my/', views.get_my_models, name='get_my_models'),
    path('all/', views.get_all_models, name='get_all_models'),
    path('all-page-models/', views.get_all_buildings_paginated, name='get_all_models_page'),

    # 分类和标签
    path('categories/', views.get_building_categories, name='get_building_categories'),
    path('tags/', views.get_building_tags, name='get_building_tags'),


    path('categories_models/', views.get_building_categories_models, name='get_building_categories'),
    path('tags_models/', views.get_building_tags_models, name='get_building_tags'),
    # 搜索
    path('searchModels/', views.search_buildings_models, name='search_buildings'),



    path('delete-model/<int:pk>/', views.delete_model_file, name='delete_model_file'),
    path('update-json/<int:pk>/', views.update_model_json, name='update_model_json'),
    path('details/<int:pk>/', views.get_model_details, name='get_model_details'),


    # JSON 数据操作
    path('builders/<int:pk>/json/', views.add_builder_json, name='add-builder-json'),  # POST
    path('builders/<int:pk>/json/update/', views.update_builder_json, name='update-builder-json'),  # PUT
    path('builders/<int:pk>/json/delete/', views.delete_builder_json, name='delete-builder-json'),  # DELETE


    # urls.py 中添加
    path('upload-building-model/<int:pk>/', views.upload_building_model, name='upload_building_model'),

    # urls.py 中添加
    path('update-builder-info/<int:pk>/', views.update_builder_info, name='update_builder_info'),


    # 新增的路由，用于管理我的模型
    path('my-models/', views.get_my_models, name='get_my_models_paginated'),
    path('my-models/<int:pk>/', views.get_model_detail, name='get_my_model_detail'),
    path('my-models/<int:pk>/update/', views.update_my_model, name='update_my_model'),
    path('my-models/<int:pk>/delete/', views.delete_my_model, name='delete_my_model'),

    path('models-with-3d/', views.get_all_models_with_3d, name='get_all_models_with_3d'),



]