from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from app.comment.models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['article_title', 'author_username', 'content_preview', 'created_at', 'is_top', 'likes', 'parent', 'updated_at']
    list_filter = ['article', 'author', 'is_top', 'created_at']
    search_fields = ['article__title', 'author__username', 'content']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-is_top', '-created_at']
    list_per_page = 50  # 每页显示50条评论
    actions = ['make_top', 'make_not_top', 'delete_selected_comments']

    # 自定义显示字段
    def article_title(self, obj):
        return obj.article.title
    article_title.short_description = _('关联文章')
    article_title.admin_order_field = 'article__title'  # 支持排序

    def author_username(self, obj):
        return obj.author.username
    author_username.short_description = _('评论者')
    author_username.admin_order_field = 'author__username'  # 支持排序

    def content_preview(self, obj):
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
    content_preview.short_description = _('评论内容')

    # 字段集，用于编辑页面
    fieldsets = (
        (_('基本信息'), {
            'fields': ('article', 'author', 'content', 'parent', 'is_top')
        }),
        (_('统计信息'), {
            'fields': ('likes', 'created_at', 'updated_at')
        }),
    )

    # 置顶评论
    def make_top(self, request, queryset):
        queryset.update(is_top=True)
        self.message_user(request, _("已将选中评论置顶"))
    make_top.short_description = _('置顶选中评论')

    # 取消置顶
    def make_not_top(self, request, queryset):
        queryset.update(is_top=False)
        self.message_user(request, _("已取消选中评论的置顶"))
    make_not_top.short_description = _('取消置顶选中评论')

    # 批量删除评论
    def delete_selected_comments(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, _(f"已删除 {count} 条评论"))
    delete_selected_comments.short_description = _('删除选中评论')

    # 优化查询性能
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('article', 'author', 'parent')

    # 保存时记录操作
    def save_model(self, request, obj, form, change):
        if change:  # 编辑时记录更新者
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)

    # 删除确认提示
    def delete_model(self, request, obj):
        obj.delete()
        self.message_user(request, _(f"已删除评论: {obj}"))