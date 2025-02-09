from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'article', 'author', 'author_name',
                  'parent', 'created_at', 'updated_at', 'likes',
                  'is_top', 'reply_count']
        read_only_fields = ['author', 'likes', 'is_top']

    def get_reply_count(self, obj):
        return obj.replies.count()