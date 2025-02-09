from app.apps import AppConfig


# app/article/apps.py



class CommentConfig(AppConfig):
    name = 'app.comment'
    verbose_name = '评论管理'
    icon = 'fa fa-comments'
