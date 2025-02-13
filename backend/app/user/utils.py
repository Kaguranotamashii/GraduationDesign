# app/user/utils.py
import os
import uuid
from datetime import datetime
from typing import Tuple, Optional
from django.core.files.uploadedfile import UploadedFile
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def validate_image(file: UploadedFile) -> Tuple[bool, Optional[str]]:
    """
    验证图片文件
    返回: (是否有效, 错误信息)
    """
    # 验证文件类型
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
    if file.content_type not in allowed_types:
        return False, "只支持JPG、PNG、GIF格式的图片"

    # 验证文件大小（5MB）
    if file.size > 5 * 1024 * 1024:
        return False, "图片大小不能超过5MB"

    return True, None

def save_image(file: UploadedFile, directory: str = 'images') -> Tuple[bool, str, Optional[str]]:
    """
    保存图片文件
    参数:
        file: 上传的文件
        directory: 存储目录
    返回:
        (是否成功, 文件路径或错误信息, 完整URL)
    """
    try:
        # 生成文件路径
        ext = os.path.splitext(file.name)[1]
        filename = f"{uuid.uuid4()}{ext}"
        upload_path = f'{directory}/{datetime.now().strftime("%Y/%m")}/{filename}'

        # 保存文件
        saved_path = default_storage.save(upload_path, ContentFile(file.read()))
        return True, saved_path, None
    except Exception as e:
        return False, str(e), None

def delete_file(file_path: str) -> bool:
    """
    删除文件
    返回: 是否删除成功
    """
    if file_path and default_storage.exists(file_path):
        try:
            default_storage.delete(file_path)
            return True
        except Exception:
            return False
    return False