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

    path('profile/', views.get_user_profile, name='get_user_profile'),
    path('profile/update/', views.update_user_profile, name='update_user_profile'),
    path('password/change/', views.change_password, name='change_password'),

    path('users/', views.user_list, name='user_list'),
    path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    path('users/<int:user_id>/status/', views.update_user_status, name='update_user_status'),
    path('avatar/upload/', views.upload_avatar, name='upload_avatar'),
    path('refresh-token/', views.refresh_auth_token, name='refresh_token'),
    path('active-sessions/', views.get_active_sessions, name='active_sessions'),
    path('active-sessions/revoke/', views.revoke_session, name='revoke_session'),

    # urls.py 中添加：
    path('google-login/', views.google_login, name='google_login'),

    path('current-user/', views.get_current_user, name='get_current_user'),


    # 管理员接口
    path('admin/users/', views.admin_user_list, name='admin_user_list'),
    path('admin/users/<int:user_id>/', views.admin_update_user, name='admin_update_user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='admin_delete_user'),
    path('admin/users/<int:user_id>/reset-password/', views.admin_reset_user_password, name='admin_reset_password'),

]
