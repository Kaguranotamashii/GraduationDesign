
from django.urls import path
from . import views

urlpatterns = [
    # 基础CRUD操作
    path('articles/create/', views.create_article, name='create_article'),  # POST
    path('articles/list/', views.get_article_list, name='get_article_list'),  # GET with pagination
    path('articles/all/', views.get_all_articles, name='get_all_articles'),  # GET without pagination
    path('articles/detail/<int:article_id>/', views.get_article_detail, name='get_article_detail'),  # GET
    path('articles/update/<int:article_id>/', views.update_article, name='update_article'),  # PUT/PATCH
    path('articles/delete/<int:article_id>/', views.delete_article, name='delete_article'),  # DELETE

    # 草稿相关
    path('articles/drafts/', views.get_drafts, name='get_drafts'),  # GET
    path('articles/draft/save/', views.save_draft, name='save_draft'),  # POST - 新建草稿
    path('articles/draft/save/<int:article_id>/', views.save_draft, name='update_draft'),  # POST - 更新草稿
    path('articles/draft/publish/<int:article_id>/', views.publish_draft, name='publish_draft'),  # POST - 发布草稿

    # 功能性接口
    path('articles/like/<int:article_id>/', views.like_article, name='like_article'),  # POST
 
    path('articles/featured/list/', views.get_featured_articles, name='get_featured_articles'),  # GET
    path('articles/my-articles/', views.get_my_articles, name='get_my_articles'),  # GET

    # 文件上传
    path('upload-image/', views.upload_image, name='upload_image'),  # POST



    path('articles/like/<int:article_id>/', views.like_article, name='like_article'),
    path('articles/unlike/<int:article_id>/', views.unlike_article, name='unlike_article'),

    path('articles/top-articles/', views.get_top_articles, name='get_top_articles'),

    path('articles/tags/', views.get_all_tags, name='get_tags'),

    path('articles/searchV2/', views.get_article_list_v2, name='search_articles'),


    path('admin/articles/create/', views.admin_create_article, name='admin_create_article'),
    path('admin/articles/list/', views.admin_get_all_articles, name='admin_get_all_articles'),
    path('admin/articles/update/<int:article_id>/', views.admin_update_article, name='admin_update_article'),
    path('admin/articles/delete/<int:article_id>/', views.admin_delete_article, name='admin_delete_article'),




]