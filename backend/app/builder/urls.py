from django.urls import path
from . import views

urlpatterns = [
    path('models/', views.add_model, name='add_model'),
    path('models/my-models/', views.get_my_models, name='get_my_models'),  # 新增路由
    path('models/all-models/', views.get_all_models, name='get_all_models'),
    path('models/all-page-models', views.get_all_buildings_paginated, name='get_all_models_page'),

]