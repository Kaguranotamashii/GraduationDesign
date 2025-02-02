# app/builder/apps.py

from django.apps import AppConfig


class BuilderConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.builder'  # 必须与INSTALLED_APPS中的路径一致
    verbose_name = '建筑管理'  # 可选：自定义显示名称
