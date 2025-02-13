# app/user/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from probject import settings


class CustomUser(AbstractUser):
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        verbose_name=_("邮箱")
    )

    signature = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("个性签名")
    )

    # 将头像字段改为CharField
    avatar = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("头像路径"),
        help_text=_("头像图片的存储路径")
    )

    def __str__(self):
        return self.username

    def get_full_avatar_url(self):
        """获取完整的头像URL"""
        if not self.avatar:
            return None
        if self.avatar.startswith(('http://', 'https://')):
            return self.avatar
        return f"{settings.URL_BASE}/media/{self.avatar}"

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'