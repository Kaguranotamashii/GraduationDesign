from django.urls import path, include

urlpatterns = [
    path('user/', include('app.user.urls')),  # user 子模块路由
    path('builder/', include('app.builder.urls')),
    path('article/', include('app.article.urls')),
    path('comment/', include('app.comment.urls')),
    path('analytics/', include('app.analytics.urls')),
    path('public/', include('app.public.urls')),
         


]
