import os
import uuid
import shutil
from django.test import TestCase
from django.core.files import File
from django.contrib.auth import get_user_model
from django.conf import settings
import openpyxl
from app.builder.models import Builder
from app.public.models import Image
from app.public.services import ImageService

class ImportBuildersTest(TestCase):
    def setUp(self):
        # 创建测试用户
        User = get_user_model()
        self.user = User.objects.create_user(
            username='admin',
            password='admin123',
            email='admin@example.com',
            is_staff=True
        )

        # 设置文件路径
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.excel_path = os.path.join(self.base_dir, 'data', 'attractions.xlsx')
        self.images_dir = os.path.join(self.base_dir, 'data', 'images')

        # 确保目录存在
        self.media_root = settings.MEDIA_ROOT
        os.makedirs(self.media_root, exist_ok=True)

        print(f"基础目录: {self.base_dir}")
        print(f"Excel文件路径: {self.excel_path}")
        print(f"图片目录: {self.images_dir}")

    def import_builders(self):
        """导入建筑物数据"""
        try:
            # 检查文件是否存在
            if not os.path.exists(self.excel_path):
                raise FileNotFoundError(f"Excel文件不存在: {self.excel_path}")

            print(f"开始读取Excel文件: {self.excel_path}")
            wb = openpyxl.load_workbook(self.excel_path)
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
                    print(f"\n处理第 {row_idx} 行: {row_data.get('name', 'Unknown')}")

                    # 处理图片
                    image_filename = row_data.get('image_filename')
                    image = None

                    if image_filename:
                        image_path = os.path.join(self.images_dir, image_filename)
                        print(f"查找图片: {image_path}")

                        if os.path.exists(image_path):
                            # 生成随机文件名
                            new_filename = f"{uuid.uuid4()}{os.path.splitext(image_filename)[1]}"
                            temp_path = os.path.join('/tmp', new_filename)

                            print(f"复制图片到临时路径: {temp_path}")
                            shutil.copy(image_path, temp_path)

                            # 创建Image对象
                            with open(temp_path, 'rb') as f:
                                image = image_service.create_image(
                                    file=File(f),
                                    creator_id=self.user.id,
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
                        creator=self.user,
                        image=image
                    )

                    success_count += 1
                    print(f"成功创建建筑: {builder.name}")

                except Exception as row_error:
                    print(f"处理第 {row_idx} 行时出错: {str(row_error)}")
                    continue

            return success_count

        except Exception as e:
            print(f"导入过程出错: {str(e)}")
            raise

    def test_import_builders(self):
        """测试导入建筑物数据"""
        try:
            success_count = self.import_builders()
            print(f"\n导入完成，成功导入 {success_count} 个建筑物")

            # 验证数据是否导入成功
            builders_count = Builder.objects.count()
            self.assertTrue(builders_count > 0, f"未能成功导入任何建筑物数据，数据库中有 {builders_count} 条记录")

        except Exception as e:
            self.fail(f"导入失败: {str(e)}")

    def tearDown(self):
        # 清理测试数据（如果需要保留数据，可以注释掉这些行）
        print("\n开始清理测试数据...")
        # Builder.objects.all().delete()
        # Image.objects.all().delete()
        if os.path.exists(self.media_root):
            shutil.rmtree(self.media_root)
        print("测试数据清理完成")