from django.urls import path
from . import views

urlpatterns = [
    # 评论的创建和列表
    path('comments/', views.add_comment, name='add-comment'),  # POST
    path('comments/article/<int:article_id>/list/', views.get_comments, name='get-comments'),  # GET

    # 评论回复
    path('comments/replies/<int:comment_id>/', views.get_replies, name='get-replies'),  # GET

    # 单个评论的操作
    path('comments/<int:pk>/', views.delete_comment, name='delete-comment'),  # DELETE
    path('comments/<int:pk>/like/', views.like_comment, name='like-comment'),  # POST
    path('comments/<int:pk>/unlike/', views.unlike_comment, name='unlike-comment'),  # POST
    path('comments/my/', views.get_my_comments, name='my-comments'),



    # 管理员 API
    path('admin/comments/', views.admin_comment_list, name='admin-comment-list'),  # GET
    path('admin/comments/<int:pk>/', views.admin_delete_comment, name='admin-delete-comment'),  # DELETE
    path('admin/comments/batch-delete/', views.admin_batch_delete_comments, name='admin-batch-delete-comments'),  # POST
    path('admin/comments/<int:pk>/toggle-top/', views.admin_toggle_top_comment, name='admin-toggle-top-comment'),  # POST
]