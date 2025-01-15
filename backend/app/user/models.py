from django.db import models
from django.utils.timezone import now

class User(models.Model):
    username = models.CharField(max_length=50, unique=True)  # 用户名
    password = models.CharField(max_length=255)  # 密码
    email = models.EmailField(max_length=255, unique=True)  # 邮箱，唯一且必填
    register_time = models.DateTimeField(default=now)  # 注册时间
    signature = models.TextField(blank=True, null=True)  # 个性签名
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)  # 头像

    def __str__(self):
        return self.username
