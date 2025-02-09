from django.urls import path
from . import views

urlpatterns = [
    # 基础CRUD操作
    path('articles/', views.create_article, name='create_article'),  # POST
    path('articles/list/', views.get_article_list, name='get_article_list'),  # GET with pagination
    path('articles/all/', views.get_all_articles, name='get_all_articles'),  # GET without pagination
    path('articles/<int:article_id>/', views.get_article_detail, name='get_article_detail'),  # GET
    path('articles/<int:article_id>/', views.update_article, name='update_article'),  # PUT/PATCH
    path('articles/<int:article_id>/', views.delete_article, name='delete_article'),  # DELETE

    # 额外功能
    path('articles/<int:article_id>/like/', views.like_article, name='like_article'),
    path('articles/<int:article_id>/toggle-featured/', views.toggle_featured, name='toggle_featured'),
    path('articles/featured/', views.get_featured_articles, name='get_featured_articles'),
]