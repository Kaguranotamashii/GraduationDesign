from app.apps import AppConfig


# app/analytics


class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.analytics'
    verbose_name = '数据分析'
