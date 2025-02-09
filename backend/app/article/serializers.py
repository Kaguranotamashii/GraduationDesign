from rest_framework import serializers
from .models import Article
from ..comment.models import Comment


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'builder', 'author',
                  'created_at', 'updated_at', 'status', 'is_featured',
                  'views', 'likes', 'tags']
        read_only_fields = ['views', 'likes']
