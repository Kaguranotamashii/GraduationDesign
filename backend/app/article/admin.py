from django.contrib import admin
from django.utils.html import format_html
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'cover_preview', 'author', 'builder',
        'created_at', 'status', 'views', 'likes'
    ]
    list_display_links = ['title']
    search_fields = ['title', 'content', 'tags']
    list_filter = ['status', 'is_featured', 'created_at']
    filter_horizontal = ['content_images']

    readonly_fields = [
        'created_at', 'updated_at', 'views', 'likes',
        'cover_preview', 'content_images_preview'
    ]

    fieldsets = [
        ('基本信息', {
            'fields': ('title', 'content', 'status', 'builder', 'author', 'tags')
        }),
        ('图片', {
            'fields': ('cover_image', 'cover_preview', 'content_images', 'content_images_preview')
        }),
        ('统计信息', {
            'fields': ('views', 'likes', 'created_at', 'updated_at')
        })
    ]

    def cover_preview(self, obj):
        """封面图片预览"""
        if obj.cover_image_url:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover;" />',
                obj.cover_image_url
            )
        return "暂无图片"
    cover_preview.short_description = '封面预览'

    def content_images_preview(self, obj):
        """内容图片预览"""
        images = obj.content_images.all()
        if images:
            html = '<div style="display: flex; gap: 10px; flex-wrap: wrap;">'
            for image in images:
                html += format_html(
                    '<img src="{}" width="100" height="100" style="object-fit: cover;" />',
                    image.file.url
                )
            html += '</div>'
            return format_html(html)
        return "暂无内容图片"
    content_images_preview.short_description = '内容图片预览'

    def save_model(self, request, obj, form, change):
        """保存时自动设置作者"""
        if not change:  # 只在创建时设置作者
            obj.author = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """优化查询性能"""
        return super().get_queryset(request).select_related(
            'author', 'builder', 'cover_image'
        ).prefetch_related('content_images')