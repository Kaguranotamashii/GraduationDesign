from django.db import models
from app.article.models import Article


class Comment(models.Model):
    content = models.TextField(verbose_name='评论内容')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments', verbose_name='关联文章')
    author = models.ForeignKey('user.CustomUser', on_delete=models.CASCADE, verbose_name='评论者')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies',
                               verbose_name='父评论')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    likes = models.PositiveIntegerField(default=0, verbose_name='点赞数')
    is_top = models.BooleanField(default=False, verbose_name='是否置顶')

    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['-is_top', '-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f'{self.author.username} 的评论'


# models.py
class CommentLike(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='like_records', verbose_name='评论')
    user = models.ForeignKey('user.CustomUser', on_delete=models.CASCADE, verbose_name='点赞用户')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='点赞时间')

    class Meta:
        verbose_name = '评论点赞'
        verbose_name_plural = '评论点赞'
        unique_together = ['comment', 'user']  # 确保每个用户只能给同一评论点赞一次
        ordering = ['-created_at']
