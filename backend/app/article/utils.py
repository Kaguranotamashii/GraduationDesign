import os
import uuid
from django.conf import settings

def handle_uploaded_file(file, directory='articles'):
    """处理上传的文件

    Args:
        file: 上传的文件对象
        directory: 存储的子目录名

    Returns:
        str: 文件的相对路径
    """
    # 生成唯一文件名
    ext = os.path.splitext(file.name)[1]
    filename = f"{uuid.uuid4()}{ext}"

    # 确保目录存在
    relative_path = os.path.join(directory, filename)
    absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)

    # 写入文件
    with open(absolute_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    return relative_path

def delete_file(file_path):
    """删除文件

    Args:
        file_path: 文件的相对路径
    """
    if not file_path:
        return

    absolute_path = os.path.join(settings.MEDIA_ROOT, file_path)
    try:
        if os.path.exists(absolute_path):
            os.remove(absolute_path)
    except Exception as e:
        print(f"删除文件失败: {str(e)}")