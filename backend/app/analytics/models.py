# app/analytics/models.py

from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class APIAccessLog(models.Model):
    """API访问日志模型"""
    METHOD_CHOICES = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('DELETE', 'DELETE'),
        ('PATCH', 'PATCH'),
    ]

    user = models.ForeignKey('user.CustomUser', on_delete=models.SET_NULL, null=True, verbose_name='访问用户')
    ip_address = models.GenericIPAddressField(verbose_name='IP地址')
    method = models.CharField(max_length=10, choices=METHOD_CHOICES, verbose_name='请求方法')
    path = models.CharField(max_length=255, verbose_name='访问路径')
    status_code = models.IntegerField(verbose_name='状态码')
    response_time = models.FloatField(verbose_name='响应时间(ms)')
    user_agent = models.TextField(verbose_name='用户代理')
    request_data = models.JSONField(null=True, blank=True, verbose_name='请求数据')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='访问时间')

    class Meta:
        verbose_name = 'API访问日志'
        verbose_name_plural = 'API访问日志'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['path', '-timestamp']),
        ]


class UserAction(models.Model):
    """用户行为记录模型"""
    ACTION_TYPES = [
        ('view', '查看'),
        ('create', '创建'),
        ('update', '更新'),
        ('delete', '删除'),
        ('like', '点赞'),
        ('comment', '评论'),
    ]

    user = models.ForeignKey('user.CustomUser', on_delete=models.CASCADE, verbose_name='用户')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES, verbose_name='行为类型')

    # 通用外键，可以关联到任何模型
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='操作时间')
    extra_data = models.JSONField(null=True, blank=True, verbose_name='额外数据')

    class Meta:
        verbose_name = '用户行为'
        verbose_name_plural = '用户行为'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action_type', '-timestamp']),
        ]


class DailyStatistics(models.Model):
    """每日统计数据模型"""
    date = models.DateField(unique=True, verbose_name='统计日期')

    # 用户统计
    total_users = models.IntegerField(default=0, verbose_name='总用户数')
    new_users = models.IntegerField(default=0, verbose_name='新增用户数')
    active_users = models.IntegerField(default=0, verbose_name='活跃用户数')

    # 内容统计
    new_articles = models.IntegerField(default=0, verbose_name='新增文章数')
    new_comments = models.IntegerField(default=0, verbose_name='新增评论数')
    new_builders = models.IntegerField(default=0, verbose_name='新增建筑数')

    # 互动统计
    total_views = models.IntegerField(default=0, verbose_name='总浏览量')
    total_likes = models.IntegerField(default=0, verbose_name='总点赞数')

    # API统计
    api_calls = models.IntegerField(default=0, verbose_name='API调用次数')
    avg_response_time = models.FloatField(default=0, verbose_name='平均响应时间')
    error_count = models.IntegerField(default=0, verbose_name='错误次数')

    class Meta:
        verbose_name = '每日统计'
        verbose_name_plural = '每日统计'
        ordering = ['-date']


class UserStatistics(models.Model):
    """用户统计数据模型"""
    user = models.OneToOneField('user.CustomUser', on_delete=models.CASCADE, verbose_name='用户')

    # 文章统计
    total_articles = models.IntegerField(default=0, verbose_name='发布文章数')
    total_article_views = models.IntegerField(default=0, verbose_name='文章总浏览量')
    total_article_likes = models.IntegerField(default=0, verbose_name='文章获赞数')

    # 建筑统计
    total_builders = models.IntegerField(default=0, verbose_name='创建建筑数')

    # 评论统计
    total_comments = models.IntegerField(default=0, verbose_name='评论数')
    total_comment_likes = models.IntegerField(default=0, verbose_name='评论获赞数')

    # 活跃度统计
    last_active_time = models.DateTimeField(auto_now=True, verbose_name='最后活跃时间')
    active_days = models.IntegerField(default=0, verbose_name='活跃天数')

    class Meta:
        verbose_name = '用户统计'
        verbose_name_plural = '用户统计'
        indexes = [
            models.Index(fields=['-total_articles']),
            models.Index(fields=['-total_article_views']),
            models.Index(fields=['-active_days']),
        ]


class PopularContent(models.Model):
    """热门内容统计模型"""
    CONTENT_TYPES = [
        ('article', '文章'),
        ('builder', '建筑'),
        ('comment', '评论'),
    ]

    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, verbose_name='内容类型')
    content_id = models.PositiveIntegerField(verbose_name='内容ID')
    title = models.CharField(max_length=200, verbose_name='内容标题')
    author = models.ForeignKey('user.CustomUser', on_delete=models.CASCADE, verbose_name='作者')

    views = models.PositiveIntegerField(default=0, verbose_name='浏览量')
    likes = models.PositiveIntegerField(default=0, verbose_name='点赞数')
    comments = models.PositiveIntegerField(default=0, verbose_name='评论数')

    score = models.FloatField(default=0, verbose_name='热度分数')
    last_updated = models.DateTimeField(auto_now=True, verbose_name='最后更新时间')

    class Meta:
        verbose_name = '热门内容'
        verbose_name_plural = '热门内容'
        unique_together = ['content_type', 'content_id']
        indexes = [
            models.Index(fields=['-score']),
            models.Index(fields=['content_type', '-score']),
        ]