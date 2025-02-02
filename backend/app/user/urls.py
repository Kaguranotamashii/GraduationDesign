from django.urls import path

from . import views

urlpatterns = [
    # 发送验证码接口请求参数：{"email": "user@example.com"}
    path('send-verification-email/', views.send_verification_email, name='send_verification_email'),

    # 用户注册接口请求参数：{"username": "testuser", "password": "Test@123","email": "test@example.com","code": "123456"}
    path('register/', views.register_user, name='register'),

    # 用户登录接口 {"identifier": "test@example.com 或 username","password": "your_password"}
    path('login/', views.login_user, name='login'),

    # 用户登出接口
    path('logout/', views.logout_user, name='logout'),

    # 用户列表接口


    # 其他可能的路由...
]
