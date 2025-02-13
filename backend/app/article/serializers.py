from rest_framework import serializers
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    """文章序列化器"""

    cover_image_url = serializers.CharField(read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'builder', 'author',
            'cover_image', 'cover_image_url', 'created_at',
            'updated_at', 'status', 'is_featured',
            'views', 'likes', 'tags'
        ]
        read_only_fields = ['views', 'likes', 'created_at', 'updated_at']