# app/scripts/import_builders.py
import os
import uuid
import shutil
import django
import sys
from django.core.files import File

# 设置Django环境
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
sys.path.append(project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')  # 修改为实际的settings路径
django.setup()

from django.contrib.auth import get_user_model
from app.builder.models import Builder
from app.public.models import Image
from app.public.services import ImageService
import openpyxl

def import_builders():
    """实际导入建筑物数据的函数"""
    try:
        # 获取当前文件所在目录
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        excel_path = os.path.join(base_dir, 'data', 'attractions.xlsx')
        images_dir = os.path.join(base_dir, 'data', 'images')

        print(f"基础目录: {base_dir}")
        print(f"Excel文件路径: {excel_path}")
        print(f"图片目录: {images_dir}")

        # 检查文件是否存在
        if not os.path.exists(excel_path):
            raise FileNotFoundError(f"Excel文件不存在: {excel_path}")

        # 创建或获取管理员用户
        User = get_user_model()
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            print("创建了新的管理员用户")
        else:
            print("使用已存在的管理员用户")

        # 读取Excel文件
        print(f"开始读取Excel文件: {excel_path}")
        wb = openpyxl.load_workbook(excel_path)
        sheet = wb.active

        # 获取列名
        headers = [cell.value for cell in sheet[1]]
        print(f"Excel表头: {headers}")

        image_service = ImageService()
        success_count = 0

        # 从第二行开始读取数据
        for row_idx, row in enumerate(sheet.iter_rows(min_row=2), start=2):
            try:
                # 将行数据转换为字典
                row_data = dict(zip(headers, [cell.value for cell in row]))
                if not any(row_data.values()):  # 跳过空行
                    continue

                print(f"\n处理第 {row_idx} 行: {row_data.get('name', 'Unknown')}")

                # 处理图片
                image_filename = row_data.get('image_filename')
                image = None

                if image_filename and str(image_filename).strip():
                    image_path = os.path.join(images_dir, str(image_filename))
                    print(f"查找图片: {image_path}")

                    if os.path.exists(image_path):
                        # 生成随机文件名
                        new_filename = f"{uuid.uuid4()}{os.path.splitext(image_filename)[1]}"
                        temp_dir = os.path.join(base_dir, 'temp')
                        os.makedirs(temp_dir, exist_ok=True)
                        temp_path = os.path.join(temp_dir, new_filename)

                        print(f"复制图片到临时路径: {temp_path}")
                        shutil.copy(image_path, temp_path)

                        # 创建Image对象
                        with open(temp_path, 'rb') as f:
                            image = image_service.create_image(
                                file=File(f),
                                creator_id=admin_user.id,
                                image_type='building',
                                name=f"建筑图片-{row_data.get('name', '')}"
                            )

                        os.remove(temp_path)
                        print(f"图片处理成功: {new_filename}")
                    else:
                        print(f"警告: 图片文件不存在: {image_path}")

                # 创建Builder对象
                builder = Builder.objects.create(
                    name=row_data.get('name', ''),
                    description=row_data.get('description', ''),
                    address=row_data.get('address', ''),
                    category=row_data.get('category', ''),
                    tags=row_data.get('tags', ''),
                    creator=admin_user,
                    image=image
                )

                success_count += 1
                print(f"成功创建建筑: {builder.name}")

            except Exception as row_error:
                print(f"处理第 {row_idx} 行时出错: {str(row_error)}")
                continue

        print(f"\n导入完成，成功导入 {success_count} 个建筑物")
        return success_count

    except Exception as e:
        print(f"导入过程出错: {str(e)}")
        raise

if __name__ == '__main__':
    try:
        import_builders()
    except Exception as e:
        print(f"程序执行出错: {str(e)}")