from backend.app import models
from backend.app.user.models import User


class Building(models.Model):
    building_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)  # 建筑名称
    address = models.CharField(max_length=255)  # 建筑地址

    #建筑分类
    category = models.CharField(max_length=50)

    description = models.TextField(blank=True, null=True)  # 楼宇描述
    image = models.ImageField(
        upload_to='buildings/%Y/%m/',  # 按年月自动分目录
        blank=True,
        null=True
    )
    model_file = models.FileField(
        upload_to='models/%Y/%m/%d/',  # 按年月日分目录
        blank=True,
        null=True
    )

     # 元数据
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    #上传者id 这里我要的是数字
    uploader_id = models.IntegerField(blank=True, null=True)


    #模型描述json
    model_description = models.TextField(blank=True, null=True)


    

    def __str__(self):
        return self.name