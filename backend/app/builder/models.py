#app/builder/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class Builder(models.Model):
    name = models.CharField(max_length=200)  # 建筑物名称
    description = models.TextField()  # 建筑物描述
    address = models.CharField(max_length=200)  # 地址
    created_at = models.DateTimeField(auto_now_add=True)  # 创建时间
    updated_at = models.DateTimeField(auto_now=True)  # 更新时间
    category = models.CharField(max_length=100)  # 建筑物分类
    creator = models.ForeignKey('user.CustomUser', on_delete=models.CASCADE)  # 创建者
    image = models.ImageField(upload_to='builders/', blank=True, null=True)  # 建筑物图片
    model = models.FileField(upload_to='builders/models/', blank=True, null=True)  # 建筑物模型文件
    json = models.TextField(blank=True, null=True)  # 建筑物的 JSON 描述
    md = models.TextField(blank=True, null=True)  #MD文档

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = '建筑'
        verbose_name_plural = '建筑'
        permissions = [
            ("can_edit_builder", "Can edit builder"),
        ]
