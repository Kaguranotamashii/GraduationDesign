# app/user/apps.py

from django.apps import AppConfig

class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.user'  # 必须与INSTALLED_APPS中的路径一致
    verbose_name = '用户管理'  # 可选：自定义显示名称
