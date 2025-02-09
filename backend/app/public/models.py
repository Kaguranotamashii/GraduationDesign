from django.db import models
from django.utils.translation import gettext_lazy as _
from app.user.models import CustomUser


class Image(models.Model):
    """图片模型类"""

    class ImageType(models.TextChoices):
        AVATAR = 'avatar', _('头像')
        ARTICLE = 'article', _('文章图片')
        BUILDING = 'building', _('建筑物图片')
        OTHER = 'other', _('其他')

    name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("图片名称"),
        help_text=_("图片的显示名称，可选")
    )

    description = models.TextField(
        blank=True,
        null=True,  # 添加 null=True
        verbose_name=_("图片描述"),
        help_text=_("关于图片的详细描述")
    )

    file = models.CharField(  # 改为 CharField 来存储路径
        max_length=255,
        verbose_name=_("图片路径"),
        help_text=_("图片文件的存储路径")
    )

    image_type = models.CharField(
        max_length=20,
        choices=ImageType.choices,
        default=ImageType.OTHER,
        verbose_name=_("图片类型"),
        help_text=_("图片的用途类型")
    )

    creator = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_("创建者"),
        help_text=_("图片的创建者")
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("创建时间"),
        help_text=_("图片创建的时间")
    )

    class Meta:
        verbose_name = _("图片")
        verbose_name_plural = _("图片")
        ordering = ['-created_at']

    def __str__(self):
        """返回图片对象的字符串表示"""
        return self.name or f"Image_{self.id}"

    @property
    def file_size(self):
        """返回文件大小"""
        if self.file:
            return self.file.size
        return 0

    @property
    def file_extension(self):
        """返回文件扩展名"""
        if self.file:
            return self.file.name.split('.')[-1].lower()
        return ''