
# public/apps.py
from django.apps import AppConfig

class PublicConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.public'
    verbose_name = '公共模块'

