from django.urls import path
from . import views

urlpatterns = [
    # 上传图片
    path('upload/', views.upload_image, name='upload_image'),

    # 获取图片列表
    path('list/', views.get_image_list, name='get_image_list'),

    # 获取图片详情
    path('<int:image_id>/', views.get_image_detail, name='get_image_detail'),

    # 更新图片信息（仅管理员）
    path('<int:image_id>/update/', views.update_image, name='update_image'),

    # 删除图片（仅管理员）
    path('<int:image_id>/delete/', views.delete_image, name='delete_image'),

    # 获取用户特定类型的图片
    path('user/<int:user_id>/type/<str:image_type>/',
         views.get_user_type_image,
         name='get_user_type_image'),
]