# app/analytics/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from app.article.models import Article
from app.builder.models import Builder
from app.user.models import CustomUser
from .models import UserAction, UserStatistics

# 用户统计信号处理
@receiver(post_save, sender=CustomUser)
def create_user_statistics(sender, instance, created, **kwargs):
    if created:
        UserStatistics.objects.create(user=instance)

# 文章相关信号
@receiver(post_save, sender=Article)
def track_article_action(sender, instance, created, **kwargs):
    if created:
        # 记录创建文章行为
        UserAction.objects.create(
            user=instance.author,
            action_type='create',
            content_type=ContentType.objects.get_for_model(Article),
            object_id=instance.id
        )

        # 更新用户统计
        stats, _ = UserStatistics.objects.get_or_create(user=instance.author)
        stats.total_articles += 1
        stats.save()

# 建筑相关信号
@receiver(post_save, sender=Builder)
def track_builder_action(sender, instance, created, **kwargs):
    if created:
        UserAction.objects.create(
            user=instance.creator,
            action_type='create',
            content_type=ContentType.objects.get_for_model(Builder),
            object_id=instance.id
        )

        stats, _ = UserStatistics.objects.get_or_create(user=instance.creator)
        stats.total_builders += 1
        stats.save()