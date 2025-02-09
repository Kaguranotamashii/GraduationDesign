from django.contrib import admin
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.template.response import TemplateResponse
from django.http import HttpResponseRedirect
from django import forms
from .models import Article
from .utils import ArticleContentMigrator


class DomainMigrationForm(forms.Form):
    """域名迁移表单"""
    old_domain = forms.CharField(
        label='旧域名',
        help_text='例如: https://old-domain.com',
        required=True
    )
    new_domain = forms.CharField(
        label='新域名',
        help_text='例如: https://new-domain.com',
        required=True
    )
    test_mode = forms.BooleanField(
        label='测试模式',
        required=False,
        initial=True,
        help_text='开启测试模式不会实际修改数据，只会显示将要修改的内容'
    )


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'cover_preview', 'author', 'builder',
        'created_at', 'status', 'views', 'likes'
    ]
    search_fields = ['title', 'content', 'tags']
    list_filter = ['status', 'is_featured', 'created_at']
    readonly_fields = [
        'created_at', 'updated_at', 'views', 'likes',
        'cover_preview', 'content_images_preview'
    ]

    actions = ['make_published', 'make_draft', 'migrate_selected_articles']
    change_list_template = 'admin/article/article_changelist.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'migrate-domain/',
                self.admin_site.admin_view(self.migrate_domain_view),
                name='article_migrate_domain'
            ),
            path(
                'execute-migration/',
                self.admin_site.admin_view(self.execute_migration_view),
                name='execute_domain_migration'
            ),
        ]
        return custom_urls + urls

    def migrate_domain_view(self, request):
        """显示域名迁移表单"""
        context = {
            **self.admin_site.each_context(request),
            'title': '域名迁移',
            'form': DomainMigrationForm(),
            'opts': self.model._meta,
        }
        return TemplateResponse(
            request,
            'admin/article/domain_migration_form.html',
            context
        )

    def execute_migration_view(self, request):
        """执行域名迁移"""
        if request.method != 'POST':
            return HttpResponseRedirect('../')

        form = DomainMigrationForm(request.POST)
        if not form.is_valid():
            messages.error(request, '请填写有效的域名信息')
            return HttpResponseRedirect('.')

        old_domain = form.cleaned_data['old_domain']
        new_domain = form.cleaned_data['new_domain']
        test_mode = form.cleaned_data['test_mode']

        migrator = ArticleContentMigrator(
            old_domain=old_domain,
            new_domain=new_domain
        )

        if test_mode:
            # 测试模式：只显示将要修改的内容
            results = []
            articles = Article.objects.all()
            for article in articles:
                validation = migrator.validate_article(article)
                if not validation['is_valid']:
                    results.append({
                        'article': article,
                        'invalid_urls': validation['invalid_urls']
                    })

            context = {
                **self.admin_site.each_context(request),
                'title': '域名迁移测试结果',
                'results': results,
                'old_domain': old_domain,
                'new_domain': new_domain,
                'opts': self.model._meta,
            }
            return TemplateResponse(
                request,
                'admin/article/domain_migration_results.html',
                context
            )
        else:
            # 执行实际迁移
            result = migrator.migrate_all_articles()
            self.message_user(
                request,
                f"域名迁移完成: 总计 {result['total']} 篇文章, "
                f"成功 {result['success']} 篇, "
                f"失败 {result['failed']} 篇"
            )
            return HttpResponseRedirect('../')

    def migrate_selected_articles(self, request, queryset):
        """迁移选中的文章"""
        if 'apply' in request.POST:
            form = DomainMigrationForm(request.POST)
            if form.is_valid():
                old_domain = form.cleaned_data['old_domain']
                new_domain = form.cleaned_data['new_domain']
                test_mode = form.cleaned_data['test_mode']

                migrator = ArticleContentMigrator(
                    old_domain=old_domain,
                    new_domain=new_domain
                )

                if test_mode:
                    results = []
                    for article in queryset:
                        validation = migrator.validate_article(article)
                        if not validation['is_valid']:
                            results.append({
                                'article': article,
                                'invalid_urls': validation['invalid_urls']
                            })

                    context = {
                        'title': '域名迁移测试结果',
                        'results': results,
                        'old_domain': old_domain,
                        'new_domain': new_domain,
                        'queryset': queryset,
                        'opts': self.model._meta,
                    }
                    return TemplateResponse(
                        request,
                        'admin/article/domain_migration_results.html',
                        context
                    )
                else:
                    success_count = 0
                    for article in queryset:
                        if migrator.migrate_single_article(article):
                            success_count += 1

                    self.message_user(
                        request,
                        f'成功迁移 {success_count} 篇文章中的域名'
                    )
                    return HttpResponseRedirect(request.get_full_path())

        form = DomainMigrationForm()
        context = {
            'title': '域名迁移',
            'form': form,
            'queryset': queryset,
            'opts': self.model._meta,
        }
        return TemplateResponse(
            request,
            'admin/article/domain_migration_form.html',
            context
        )

    migrate_selected_articles.short_description = "迁移选中文章的域名"