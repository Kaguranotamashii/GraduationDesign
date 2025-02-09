from django.db import models
from django.utils.translation import gettext_lazy as _
from app.user.models import CustomUser
from app.public.models import Image

class Builder(models.Model):
    name = models.CharField(max_length=200, verbose_name=_('建筑物名称'))
    description = models.TextField(verbose_name=_('建筑物描述'))
    address = models.CharField(max_length=200, verbose_name=_('地址'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('创建时间'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('更新时间'))
    category = models.CharField(max_length=100, verbose_name=_('建筑物分类'))
    creator = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name=_('创建者'),
        related_name='buildings'
    )
    image = models.ForeignKey(
        Image,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('建筑物图片')
    )
    model = models.FileField(
        upload_to='builders/models/',
        blank=True,
        null=True,
        verbose_name=_('建筑物模型文件')
    )
    json = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('建筑物的 JSON 描述')
    )
    tags = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('建筑物标签')
    )

    @property
    def image_url(self):
        return self.image.file.url if self.image else None

    def get_tags_list(self):
        if not self.tags:
            return []
        return [tag.strip() for tag in self.tags.split(',')]