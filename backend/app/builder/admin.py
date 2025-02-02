from django.contrib import admin
from app.builder.models import Builder

@admin.register(Builder)
class BuilderAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at', 'updated_at', 'creator']
    search_fields = ['name', 'description']
    list_filter = ['category', 'created_at']
    readonly_fields = ['created_at', 'updated_at']