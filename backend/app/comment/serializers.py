# serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Comment, CommentLike


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    # 添加文章标题
    article_title = serializers.CharField(source='article.title', read_only=True)
    # 添加父评论作者名称
    parent_author_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'article', 'article_title', 'author',
                  'author_name', 'author_avatar', 'parent', 'parent_author_name',
                  'created_at', 'updated_at', 'likes', 'is_top',
                  'reply_count', 'is_liked']
        read_only_fields = ['likes', 'is_top']

    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'get_full_avatar_url'):
            return obj.author.get_full_avatar_url()
        return None

    def get_reply_count(self, obj):
        return obj.replies.count()

    def get_parent_author_name(self, obj):
        if obj.parent and obj.parent.author:
            return obj.parent.author.username
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request:
            return False

        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return False

        token = auth_header.split(' ')[1]
        try:
            auth = JWTAuthentication()
            validated_token = auth.get_validated_token(token)
            user_id = auth.get_user(validated_token)
            if user_id:
                return CommentLike.objects.filter(
                    comment=obj,
                    user_id=user_id
                ).exists()
        except:
            return False

        return False