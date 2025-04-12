from django.contrib import admin
from django.utils.html import format_html

from .models import DailyStatistics, UserStatistics, PopularContent, APIAccessLog, UserAction


@admin.register(APIAccessLog)
class APIAccessLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_display', 'ip_address', 'method', 'path', 'status_code_display',
                    'response_time_display', 'timestamp')
    list_filter = ('method', 'status_code', 'timestamp')
    search_fields = ('ip_address', 'path', 'user__username')
    readonly_fields = ('timestamp', 'user', 'ip_address', 'method', 'path', 'status_code',
                       'response_time', 'user_agent', 'request_data')
    date_hierarchy = 'timestamp'
    ordering = ('-timestamp',)

    def user_display(self, obj):
        if obj.user:
            return obj.user.username
        return '匿名用户'
    user_display.short_description = '用户'

    def status_code_display(self, obj):
        if obj.status_code < 300:
            color = 'green'
        elif obj.status_code < 400:
            color = 'blue'
        elif obj.status_code < 500:
            color = 'orange'
        else:
            color = 'red'
        return format_html('<span style="color: {}">{}</span>', color, obj.status_code)
    status_code_display.short_description = '状态码'

    def response_time_display(self, obj):
        if obj.response_time < 100:
            color = 'green'
        elif obj.response_time < 500:
            color = 'orange'
        else:
            color = 'red'
        # 修复格式问题 - 先格式化数字，然后传入format_html
        formatted_time = f"{float(obj.response_time):.2f}"
        return format_html('<span style="color: {}">{} ms</span>', color, formatted_time)
    response_time_display.short_description = '响应时间'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


# @admin.register(DailyStatistics)
# class DailyStatisticsAdmin(admin.ModelAdmin):
#     list_display = ('date', 'total_users', 'new_users', 'active_users', 'new_articles',
#                     'new_comments', 'new_builders', 'total_views', 'total_likes',
#                     'api_calls', 'avg_response_time', 'error_count')
#     list_filter = ('date',)
#     date_hierarchy = 'date'
#     search_fields = ('date',)
#     readonly_fields = ('date',)
#     ordering = ('-date',)


@admin.register(UserStatistics)
class UserStatisticsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_articles', 'total_article_views', 'total_article_likes',
                    'total_builders', 'total_comments', 'active_days', 'last_active_time')
    list_filter = ('last_active_time',)
    search_fields = ('user__username',)
    readonly_fields = ('user', 'last_active_time')
    ordering = ('-active_days',)

#
# @admin.register(PopularContent)
# class PopularContentAdmin(admin.ModelAdmin):
#     list_display = ('title', 'content_type', 'author', 'views', 'likes',
#                     'comments', 'score', 'last_updated')
#     list_filter = ('content_type', 'last_updated')
#     search_fields = ('title', 'author__username')
#     readonly_fields = ('score', 'last_updated')
#     ordering = ('-score',)


@admin.register(UserAction)
class UserActionAdmin(admin.ModelAdmin):
    list_display = ('user', 'action_type', 'content_type', 'object_id', 'timestamp')
    list_filter = ('action_type', 'timestamp')
    search_fields = ('user__username', 'action_type')
    readonly_fields = ('user', 'action_type', 'content_type', 'object_id', 'content_object', 'timestamp', 'extra_data')
    date_hierarchy = 'timestamp'
    ordering = ('-timestamp',)