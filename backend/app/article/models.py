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
        verbose_name=_('关联建筑'),
        null=True,
        blank=True
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

    draft_saved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('草稿保存时间')
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('发布时间')
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

    def save(self, *args, **kwargs):
        # 处理状态变更
        if self.pk:  # 如果是更新已存在的对象
            old_obj = Article.objects.get(pk=self.pk)
            # 如果状态从草稿变为已发布
            if old_obj.status == 'draft' and self.status == 'published':
                from django.utils import timezone
                self.published_at = timezone.now()
        # 如果是新对象且状态为已发布
        elif self.status == 'published':
            from django.utils import timezone
            self.published_at = timezone.now()

        # 如果状态为草稿，更新草稿保存时间
        if self.status == 'draft':
            from django.utils import timezone
            self.draft_saved_at = timezone.now()

        super().save(*args, **kwargs)

    def get_tags_list(self):
        """获取标签列表"""
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

    @property
    def cover_image_url(self):
        """获取封面图片URL"""
        if self.cover_image:
            return os.path.join(settings.MEDIA_URL, self.cover_image)
        return None


# models.py

class ArticleLike(models.Model):
    """文章点赞记录"""
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='like_records',
        verbose_name=_('文章')
    )
    user = models.ForeignKey(
        'user.CustomUser',
        on_delete=models.CASCADE,
        verbose_name=_('用户')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('点赞时间')
    )

    class Meta:
        verbose_name = _('文章点赞记录')
        verbose_name_plural = _('文章点赞记录')
        # 确保每个用户只能给同一篇文章点赞一次
        unique_together = ['article', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} 赞了 {self.article.title}"