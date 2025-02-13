from django.contrib import admin
from django.utils.html import format_html
from .models import Builder

@admin.register(Builder)
class BuilderAdmin(admin.ModelAdmin):
    list_display = ['name', 'image_preview', 'category', 'created_at', 'updated_at', 'creator']
    search_fields = ['name', 'description', 'address']
    list_filter = ['category', 'created_at', 'creator']
    readonly_fields = ['created_at', 'updated_at', 'image_preview']

    def image_preview(self, obj):
        """图片预览"""
        if obj.image:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover;" />',
                obj.get_image_url()
            )
        return "暂无图片"

    image_preview.short_description = '图片预览'