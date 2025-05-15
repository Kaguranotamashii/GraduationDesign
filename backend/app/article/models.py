from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import os

class Article(models.Model):
    """文章模型"""
    STATUS_CHOICES = (
        ('draft', _('草稿')),
        ('reviewing', _('审核中')),
        ('review_failed', _('审核失败')),
        ('published', _('已发布')),
    )

    title = models.CharField(
        max_length=200,
        verbose_name=_('标题'),
        help_text=_('文章标题，最多200字符')
    )

    content = models.TextField(
        verbose_name=_('内容'),
        help_text=_('文章正文')
    )

    builder = models.ForeignKey(
        'builder.Builder',
        on_delete=models.SET_NULL,
        related_name='articles',
        verbose_name=_('关联建筑'),
        null=True,
        blank=True,
        help_text=_('关联的建筑，删除建筑时置空')
    )

    author = models.ForeignKey(
        'user.CustomUser',
        on_delete=models.CASCADE,
        related_name='articles',
        verbose_name=_('作者'),
        help_text=_('文章作者')
    )

    cover_image = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name=_('封面图片路径'),
        help_text=_('封面图片的存储路径')
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('创建时间'),
        help_text=_('文章创建时间')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('更新时间'),
        help_text=_('文章最后更新时间')
    )

    draft_saved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('草稿保存时间'),
        help_text=_('最后保存草稿或审核中状态的时间')
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('发布时间'),
        help_text=_('文章发布时间')
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name=_('状态'),
        help_text=_('文章状态：草稿、审核中、审核失败、已发布')
    )

    is_featured = models.BooleanField(
        default=False,
        verbose_name=_('是否精选'),
        help_text=_('是否为精选文章')
    )

    views = models.PositiveIntegerField(
        default=0,
        verbose_name=_('浏览量'),
        help_text=_('文章浏览次数')
    )

    likes = models.PositiveIntegerField(
        default=0,
        verbose_name=_('点赞数'),
        help_text=_('文章点赞次数')
    )

    tags = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('标签'),
        help_text=_('逗号分隔的标签，如：科技,编程')
    )

    class Meta:
        verbose_name = _('文章')
        verbose_name_plural = _('文章')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """自定义保存逻辑，处理时间戳"""
        from django.utils import timezone
        current_time = timezone.now()

        if self.status in ['draft', 'reviewing', 'review_failed']:
            self.draft_saved_at = current_time
            self.published_at = None
        elif self.status == 'published':
            self.published_at = current_time
            self.draft_saved_at = None

        super().save(*args, **kwargs)

    def get_tags_list(self):
        """获取标签列表"""
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

    @property
    def cover_image_url(self):
        """获取封面图片完整 URL"""
        if self.cover_image:
            return os.path.join(settings.MEDIA_URL, self.cover_image)
        return None


class ArticleLike(models.Model):
    """文章点赞记录模型"""
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='like_records',
        verbose_name=_('文章'),
        help_text=_('关联的文章')
    )
    user = models.ForeignKey(
        'user.CustomUser',
        on_delete=models.CASCADE,
        related_name='article_likes',
        verbose_name=_('用户'),
        help_text=_('点赞的用户')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('点赞时间'),
        help_text=_('点赞时间')
    )

    class Meta:
        verbose_name = _('文章点赞记录')
        verbose_name_plural = _('文章点赞记录')
        unique_together = ['article', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} 点赞了 {self.article.title}"