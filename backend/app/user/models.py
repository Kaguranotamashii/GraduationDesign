# app/user/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    # 强制 email 字段唯一且必填（覆盖默认的 email 字段）
    email = models.EmailField(unique=True, blank=False, null=False)
    # 个性签名（Django 自带的 User 没有此字段）
    signature = models.TextField(blank=True, null=True)
    # 头像（Django 自带的 User 没有此字段）
    avatar = models.FileField(
        upload_to='avatars/%Y/%m/%d/',  # 修正路径格式为 %Y/%m/%d
        blank=True,
        null=True
    )

    def __str__(self):
        return self.username
    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'