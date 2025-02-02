from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from app.user.models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'is_staff', 'is_active']
    search_fields = ['username', 'email']
    list_filter = ['is_staff', 'is_active']
    ordering = ['username']

    # 添加 list_editable 允许直接在列表页面编辑
    list_editable = ['is_active']

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('个人信息', {'fields': ('email', 'signature', 'avatar')}),
        ('权限', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('重要日期', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

# 修改管理界面标题
admin.site.site_header = '建筑管理系统'
admin.site.site_title = '建筑管理系统'
admin.site.index_title = '管理后台'
