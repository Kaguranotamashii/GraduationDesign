from django.contrib import admin
from app.comment.models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['article', 'author', 'content', 'created_at', 'is_top', 'likes', 'parent', 'updated_at']
    list_filter = ['article', 'author', 'created_at', 'is_top', 'likes', 'parent', 'updated_at']
    search_fields = ['article', 'author', 'content', 'created_at', 'is_top', 'likes', 'parent', 'updated_at']
    readonly_fields =['created_at', 'updated_at']
    ordering = ['-created_at']
    actions = ['make_top', 'make_not_top']