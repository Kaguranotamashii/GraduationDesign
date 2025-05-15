from django.urls import path
from . import views

urlpatterns = [
    # 用户文章操作
    path('articles/create/', views.create_article, name='create_article'),  # POST 创建文章
    path('articles/list/', views.get_article_list, name='get_article_list'),  # GET 分页文章列表
    path('articles/all/', views.get_all_articles, name='get_all_articles'),  # GET 所有文章（不分页）
    path('articles/detail/<int:article_id>/', views.get_article_detail, name='get_article_detail'),  # GET 文章详情
    path('articles/update/<int:article_id>/', views.update_article, name='update_article'),  # PUT/PATCH 更新文章
    path('articles/delete/<int:article_id>/', views.delete_article, name='delete_article'),  # DELETE 删除文章

    # 草稿相关
    path('articles/drafts/', views.get_drafts, name='get_drafts'),  # GET 用户草稿列表
    path('articles/draft/save/', views.save_draft, name='save_draft'),  # POST 保存新草稿
    path('articles/draft/save/<int:article_id>/', views.save_draft, name='update_draft'),  # POST 更新草稿
    path('articles/draft/submit/<int:article_id>/', views.submit_draft, name='submit_draft'),  # POST 提交审核

    # 功能性接口
    path('articles/like/<int:article_id>/', views.like_article, name='like_article'),  # POST 点赞
    path('articles/unlike/<int:article_id>/', views.unlike_article, name='unlike_article'),  # POST 取消点赞
    path('articles/featured/', views.get_featured_articles, name='get_featured_articles'),  # GET 精选文章
    path('articles/my-articles/', views.get_my_articles, name='get_my_articles'),  # GET 我的文章
    path('articles/top/', views.get_top_articles, name='get_top_articles'),  # GET 热门文章
    path('articles/tags/', views.get_all_tags, name='get_tags'),  # GET 所有标签
    path('articles/search/', views.search_articles, name='search_articles'),  # GET 搜索文章

    # 文件上传
    path('upload-image/', views.upload_image, name='upload_image'),  # POST 上传图片

    # 管理员操作
    path('admin/articles/create/', views.admin_create_article, name='admin_create_article'),  # POST 管理员创建
    path('admin/articles/list/', views.admin_get_all_articles, name='admin_get_all_articles'),  # GET 所有文章
    path('admin/articles/update/<int:article_id>/', views.admin_update_article, name='admin_update_article'),  # PUT/PATCH 更新
    path('admin/articles/delete/<int:article_id>/', views.admin_delete_article, name='admin_delete_article'),  # DELETE 删除
    path('admin/articles/review/<int:article_id>/', views.admin_review_article, name='admin_review_article'),  # POST 审批文章
]