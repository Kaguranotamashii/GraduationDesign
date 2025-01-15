from django.urls import path

from . import views


urlpatterns = [


    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('change_password/', views.change_password, name='change_password'),
    path('user_all/', views.get_all_users, name='user_info'),
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),  # 新增的路


    path('send_verification_email/', views.send_verification_email, name='send_verification_email'),  # 发送验证码
]
