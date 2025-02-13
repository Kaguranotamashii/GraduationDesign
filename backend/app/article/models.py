from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from app.builder.models import Builder
import os


class Article(models.Model):
    """文章模型"""

    STATUS_CHOICES = (
        ('draft', _('草稿')),
        ('published', _('已发布')),
    )

    title = models.CharField(
        max_length=200,
        verbose_name=_('标题')
    )

    content = models.TextField(
        verbose_name=_('内容')
    )

    builder = models.ForeignKey(
        Builder,
        on_delete=models.CASCADE,
        related_name='articles',
        verbose_name=_('关联建筑')
    )

    author = models.ForeignKey(
        'user.CustomUser',
        on_delete=models.CASCADE,
        verbose_name=_('作者')
    )

    cover_image = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name=_('封面图片路径')
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('创建时间')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('更新时间')
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name=_('状态')
    )

    is_featured = models.BooleanField(
        default=False,
        verbose_name=_('是否精选')
    )

    views = models.PositiveIntegerField(
        default=0,
        verbose_name=_('浏览量')
    )

    likes = models.PositiveIntegerField(
        default=0,
        verbose_name=_('点赞数')
    )

    tags = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('标签'),
        help_text=_('多个标签用逗号分隔')
    )

    class Meta:
        verbose_name = _('文章')
        verbose_name_plural = _('文章')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return self.title

    def get_tags_list(self):
        """获取标签列表"""
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

    @property
    def cover_image_url(self):
        """获取封面图片URL"""
        if self.cover_image:
            return os.path.join(settings.MEDIA_URL, self.cover_image)
        return None