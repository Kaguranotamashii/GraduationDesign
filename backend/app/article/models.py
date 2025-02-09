from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from app.builder.models import Builder
from app.public.models import Image
import re


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

    cover_image = models.ForeignKey(
        Image,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='article_covers',
        verbose_name=_('封面图片')
    )

    content_images = models.ManyToManyField(
        Image,
        blank=True,
        related_name='article_contents',
        verbose_name=_('内容图片')
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
        if self.cover_image and self.cover_image.file:
            return self.cover_image.file.url
        return None

    def process_content_urls(self, new_domain=None):
        """处理内容中的图片URL"""
        if not self.content:
            return self.content

        new_domain = new_domain or settings.URL_BASE
        img_pattern = r'!\[.*?\]\((.*?)\)'

        def replace_url(match):
            url = match.group(1)
            if url.startswith('/'):
                return f"![](${new_domain}{url})"
            old_domains = getattr(settings, 'OLD_DOMAINS', [])
            for old_domain in old_domains:
                if url.startswith(old_domain):
                    return f"![]{url.replace(old_domain, new_domain)}"
            return match.group(0)

        return re.sub(img_pattern, replace_url, self.content)

    def save(self, *args, **kwargs):
        """重写保存方法"""
        if not self.pk or 'content' in kwargs.get('update_fields', []):
            self.content = self.process_content_urls()
        super().save(*args, **kwargs)