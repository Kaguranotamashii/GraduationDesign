from django.conf import settings
import re
from .models import Article


class ArticleContentMigrator:
    """文章内容迁移工具"""

    def __init__(self, old_domain=None, new_domain=None):
        self.old_domain = old_domain or getattr(settings, 'OLD_DOMAIN', '')
        self.new_domain = new_domain or settings.URL_BASE

    def migrate_single_article(self, article):
        """迁移单篇文章的内容"""
        try:
            article.content = article.process_content_urls(new_domain=self.new_domain)
            article.save(update_fields=['content'])
            return True
        except Exception as e:
            print(f"迁移文章 {article.id} 失败: {str(e)}")
            return False

    def migrate_all_articles(self):
        """迁移所有文章的内容"""
        success_count = 0
        fail_count = 0
        articles = Article.objects.all()

        for article in articles:
            if self.migrate_single_article(article):
                success_count += 1
            else:
                fail_count += 1

        return {
            'total': len(articles),
            'success': success_count,
            'failed': fail_count
        }

    def validate_content(self, content):
        """验证内容中的图片URL是否都是有效的"""
        img_pattern = r'!\[.*?\]\((.*?)\)'
        invalid_urls = []

        for match in re.finditer(img_pattern, content):
            url = match.group(1)
            if self.old_domain in url:
                invalid_urls.append(url)

        return {
            'is_valid': len(invalid_urls) == 0,
            'invalid_urls': invalid_urls
        }

    def validate_article(self, article):
        """验证单篇文章的内容"""
        return self.validate_content(article.content)