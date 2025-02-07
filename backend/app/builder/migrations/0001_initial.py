# Generated by Django 5.0.7 on 2025-02-02 14:38

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Builder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('address', models.CharField(max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.CharField(max_length=100)),
                ('image', models.ImageField(blank=True, null=True, upload_to='builders/')),
                ('model', models.FileField(blank=True, null=True, upload_to='builders/models/')),
                ('json', models.TextField(blank=True, null=True)),
                ('md', models.TextField(blank=True, null=True)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '建筑',
                'verbose_name_plural': '建筑',
                'permissions': [('can_edit_builder', 'Can edit builder')],
            },
        ),
    ]
