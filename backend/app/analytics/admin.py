
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from app.user.models import CustomUser
from .models import DailyStatistics, UserStatistics, PopularContent, APIAccessLog, UserAction
from .tasks import update_daily_statistics, update_popular_content
from .signals import create_user_statistics, track_article_action, track_builder_action
from .middleware import AnalyticsMiddleware

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    filter_horizontal = ()
    fieldsets = (
        (None, {'fields':('username', 'password')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )
    readonly_fields = ('date_joined',)
    actions = ['make_active', 'make_inactive']
    middleware_classes = [AnalyticsMiddleware]
    signals = {
        'post_save': create_user_statistics,
    }

