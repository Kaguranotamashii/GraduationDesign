from django.urls import path, include

urlpatterns = [
    path('user/', include('app.user.urls')),  # user 子模块路由
    path('builder/', include('app.builder.urls')),
         


]
