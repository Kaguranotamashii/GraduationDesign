from rest_framework import serializers
from django.conf import settings
from .models import Builder
from ..public.models import Image


class BuilderSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    # model_url = serializers.SerializerMethodField()
    # tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Builder
        fields = [
            'id', 'name', 'description', 'address', 'category',
            'tags', 'creator', 'json', 'created_at',
            'updated_at', 'image','image_url'
        ]
        extra_kwargs = {
            'json': {'required': False},
            'image': {'write_only': True}
        }

    # def get_image_url(self, obj):
    #     url = obj.image_url
    #     if url:
    #         return f"{settings.URL_BASE}{url}"
    #     return None
    #
    # def get_model_url(self, obj):
    #     try:
    #         if obj.model and hasattr(obj.model, 'url'):
    #             return f"{settings.URL_BASE}{obj.model.url}"
    #     except AttributeError:
    #         pass
    #     return None

    # def get_tags_list(self, obj):
    #     return obj.get_tags_list()
    def get_image_url(self, obj):
        if obj.image:
            try:
                return f"{settings.URL_BASE}/media/{obj.image.file}"  # 直接使用file字段的值，因为它已经是路径字符串
            except AttributeError:
                return None
