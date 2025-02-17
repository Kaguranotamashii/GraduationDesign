
from rest_framework import serializers
from rest_framework_simplejwt.authentication import JWTAuthentication

from probject import settings
from .models import Article
from .models import ArticleLike
from ..builder.serializers import BuilderSerializer


class ArticleSerializer(serializers.ModelSerializer):
    """文章序列化器"""
    cover_image_url = serializers.SerializerMethodField()
    builder_name = serializers.SerializerMethodField()
    builder = BuilderSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()


    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'builder', 'builder_name', 'author',
            'cover_image', 'cover_image_url', 'created_at', 'updated_at',
            'draft_saved_at', 'published_at', 'status', 'is_featured',
            'views', 'likes', 'tags', 'is_liked'
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



    def get_is_liked(self, obj):
        """获取当前用户是否点赞过此文章"""
        request = self.context.get('request')
        if not request:
            return False

        # 从请求头中获取 token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return False

        token = auth_header.split(' ')[1]
        try:
            # 解码 token 获取用户信息
            # JWT验证
            auth = JWTAuthentication()
            validated_token = auth.get_validated_token(token)
            user_id = auth.get_user(validated_token)
            if user_id:
                return ArticleLike.objects.filter(
                    article=obj,
                    user_id=user_id
                ).exists()
        except:
            return False

        return False

    def get_builder_name(self, obj):
        """获取关联建筑名称"""
        return obj.builder.name if obj.builder else '无'



