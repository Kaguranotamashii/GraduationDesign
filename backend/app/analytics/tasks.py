# app/analytics/tasks.py

from datetime import datetime, timedelta
from django.db.models import Count, Avg, Q
from django.utils import timezone
from app.article.models import Article
from app.builder.models import Builder
from app.user.models import CustomUser
from .models import DailyStatistics, APIAccessLog, PopularContent

def update_daily_statistics():
    """
    更新每日统计数据
    """
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)

    # 获取统计数据
    stats = {
        'total_users': CustomUser.objects.count(),
        'new_users': CustomUser.objects.filter(date_joined__date=yesterday).count(),
        'active_users': CustomUser.objects.filter(last_login__date=yesterday).count(),
        'new_articles': Article.objects.filter(created_at__date=yesterday).count(),
        'new_builders': Builder.objects.filter(created_at__date=yesterday).count(),
    }

    # API统计
    api_stats = APIAccessLog.objects.filter(timestamp__date=yesterday).aggregate(
        api_calls=Count('id'),
        avg_response_time=Avg('response_time'),
        error_count=Count('id', filter=Q(status_code__gte=400))
    )

    stats.update(api_stats)

    # 创建或更新统计记录
    DailyStatistics.objects.update_or_create(
        date=yesterday,
        defaults=stats
    )

def update_popular_content():
    """
    更新热门内容排名
    """
    # 清除旧的热门内容
    PopularContent.objects.all().delete()

    # 计算文章热度分数并创建热门内容记录
    for article in Article.objects.all():
        score = (
                        article.views * 1 +  # 1分/查看
                        article.likes * 3 +  # 3分/点赞
                        article.comments.count() * 5  # 5分/评论
                ) * (1 / (1 + (timezone.now() - article.created_at).days * 0.1))  # 时间衰减

        PopularContent.objects.create(
            content_type='article',
            content_id=article.id,
            title=article.title,
            author=article.author,
            views=article.views,
            likes=article.likes,
            comments=article.comments.count(),
            score=score
        )

