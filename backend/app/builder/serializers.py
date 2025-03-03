from rest_framework import serializers
from django.conf import settings
from .models import Builder

class BuilderSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    model_url = serializers.SerializerMethodField()  # 新增字段


    class Meta:
        model = Builder
        fields = [
            'id', 'name', 'description', 'address', 'category',
            'tags', 'creator', 'json', 'created_at', 'updated_at',
            'image', 'image_url', 'tags_list', 'model_url'
        ]
        extra_kwargs = {
            'json': {'required': False},
            'image': {'write_only': True},
            'tags': {'required': False}
        }

    def get_image_url(self, obj):
        """获取图片URL"""
        return obj.get_image_url()

    def get_tags_list(self, obj):
        """获取标签列表"""
        return obj.get_tags_list()
    def get_model_url(self, obj):
        """获取模型文件URL"""
        if obj.model:
            return f"{settings.URL_BASE}/media/{obj.model}"
        return None