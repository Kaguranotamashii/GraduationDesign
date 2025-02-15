
from rest_framework import serializers

from probject import settings
from .models import Article
from ..builder.serializers import BuilderSerializer


class ArticleSerializer(serializers.ModelSerializer):
    """文章序列化器"""
    cover_image_url = serializers.SerializerMethodField()
    builder_name = serializers.SerializerMethodField()
    builder = BuilderSerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'builder', 'builder_name', 'author',
            'cover_image', 'cover_image_url', 'created_at',
            'updated_at', 'draft_saved_at', 'published_at',
            'status', 'is_featured', 'views', 'likes', 'tags'
        ]
        read_only_fields = [
            'views', 'likes', 'created_at', 'updated_at',
            'draft_saved_at', 'published_at'
        ]

    def get_cover_image_url(self, obj):
        """获取封面图片完整URL，包含域名"""
        if obj.cover_image:
            return f"{settings.URL_BASE}/{settings.MEDIA_URL.strip('/')}/{obj.cover_image}"
        return None

    def get_builder_name(self, obj):
        """获取关联建筑名称"""
        return obj.builder.name if obj.builder else '无'