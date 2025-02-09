from app.apps import AppConfig


# app/article/apps.py


class ArticleConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.article'
    verbose_name = '文章管理'
