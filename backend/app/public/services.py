import os
from typing import Optional, List
from datetime import datetime
from django.core.files.uploadedfile import UploadedFile
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image as PILImage
from io import BytesIO

from .models import Image


class ImageService:
    def __init__(self):
        self.allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/jpg']
        self.max_size = 5 * 1024 * 1024  # 5MB

    def _validate_image(self, file: UploadedFile) -> bool:
        if file.size > self.max_size:
            raise ValidationError("图片大小不能超过5MB")
        if file.content_type not in self.allowed_types:
            raise ValidationError("仅支持 JPG、PNG、GIF 格式")
        try:
            PILImage.open(file)
            file.seek(0)
            return True
        except Exception:
            raise ValidationError("图片文件已损坏")

    def create_image(self, file: UploadedFile, creator_id: int, image_type: str = 'other', name: str = None, description: str = None) -> Image:
        try:
            self._validate_image(file)
            filename = file.name
            file_path = f'images/{datetime.now().strftime("%Y/%m")}/{filename}'
            path = default_storage.save(file_path, ContentFile(file.read()))

            image = Image.objects.create(
                file=path,
                creator_id=creator_id,
                image_type=image_type,
                name=name or filename,
                description=description or ""
            )
            return image
        except Exception as e:
            if 'path' in locals():
                default_storage.delete(path)
            raise Exception(f"创建图片记录失败: {str(e)}")