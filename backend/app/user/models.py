# app/user/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from probject import settings


class CustomUser(AbstractUser):
    # 强制 email 字段唯一且必填（覆盖默认的 email 字段）
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        verbose_name=_("邮箱")
    )

    # 个性签名
    signature = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("个性签名")
    )

    # 将头像改为ImageField，并添加验证
    avatar = models.ImageField(
        upload_to='avatars/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name=_("头像")
    )

    def __str__(self):
        return self.username
    def get_full_avatar_url(self):
        """获取完整的头像URL"""
        if not self.avatar:
            return None

        # 使用 settings.URL_BASE
        avatar_url = self.avatar.url
        if not avatar_url.startswith(('http://', 'https://')):
            avatar_url = settings.URL_BASE + avatar_url
        return avatar_url

    @property
    def avatar_url(self):
        """获取头像URL，如果没有返回None"""
        if self.avatar:
            return self.avatar.url
        return None

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'


