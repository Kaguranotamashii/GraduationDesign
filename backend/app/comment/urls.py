
from django.urls import path
from . import views

urlpatterns = [
    path('comment/create/', views.add_comment, name='add-comment'),
    path('comment/article/<int:article_id>/', views.get_comments, name='get-comments'),
    path('comment/replies/<int:comment_id>/', views.get_replies, name='get-replies'),
    path('comment/<int:pk>/delete/', views.delete_comment, name='delete-comment'),
    path('comment/<int:pk>/like/', views.like_comment, name='like-comment'),
]
