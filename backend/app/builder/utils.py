import os
import uuid
from datetime import datetime
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def save_building_image(file, name=""):
    """
    保存建筑物图片
    返回: 保存后的文件路径
    """
    # 检查文件类型
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
    if file.content_type not in allowed_types:
        raise ValueError("只支持JPG、PNG、GIF格式的图片")

    # 检查文件大小
    if file.size > 5 * 1024 * 1024:  # 5MB
        raise ValueError("图片大小不能超过5MB")

    # 生成文件路径
    ext = os.path.splitext(file.name)[1]
    filename = f"{uuid.uuid4()}{ext}"
    upload_path = f'buildings/{datetime.now().strftime("%Y/%m")}/{filename}'

    # 保存文件
    path = default_storage.save(upload_path, ContentFile(file.read()))
    return path

def delete_building_image(file_path):
    """删除建筑物图片"""
    if file_path and default_storage.exists(file_path):
        default_storage.delete(file_path)
        return True
    return False


import os
import uuid
from datetime import datetime
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def save_model_file(file, name=""):
    """
    保存建筑模型文件
    返回: 保存后的文件路径
    """
    # 检查文件大小（比如50MB）
    if file.size > 50 * 1024 * 1024:
        raise ValueError("模型文件大小不能超过50MB")

    # 生成文件路径
    ext = os.path.splitext(file.name)[1]
    filename = f"{uuid.uuid4()}{ext}"
    upload_path = f'models/{datetime.now().strftime("%Y/%m")}/{filename}'

    # 保存文件
    path = default_storage.save(upload_path, ContentFile(file.read()))
    return path

def delete_model_file(file_path):
    """删除模型文件"""
    if file_path and default_storage.exists(file_path):
        default_storage.delete(file_path)
        return True
    return False