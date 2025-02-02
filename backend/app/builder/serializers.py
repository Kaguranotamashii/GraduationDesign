from rest_framework import serializers
from .models import Builder

class BuilderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Builder
        fields = '__all__'
        extra_kwargs = {
            'creator': {'read_only': True},  # 防止客户端直接修改创建者
            'model': {'required': False},    # 模型文件非必填
            'image': {'required': False},    # 图片非必填
            'json': {'required': False}      # JSON 数据非必填
        }