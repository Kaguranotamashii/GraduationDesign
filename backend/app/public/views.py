from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.core.paginator import Paginator

from app.user.decorators import jwt_required
from .models import Image
from .services import ImageService

image_service = ImageService()

@api_view(['POST'])
@jwt_required
def upload_image(request):
    """
    上传图片
    请求参数：
    {
        "file": 文件对象,
        "name": "图片名称（可选）",
        "description": "图片描述（可选）",
        "image_type": "图片类型（可选，默认为other）"
    }
    """
    try:
        if 'file' not in request.FILES:
            return Response({
                "code": 400,
                "message": "请选择要上传的图片"
            }, status=status.HTTP_400_BAD_REQUEST)

        image = image_service.create_image(
            file=request.FILES['file'],
            creator_id=request.auth_user.id,
            name=request.data.get('name'),
            description=request.data.get('description'),
            image_type=request.data.get('image_type', Image.ImageType.OTHER)
        )

        return Response({
            "code": 200,
            "message": "上传成功",
            "data": {
                "id": image.id,
                "name": image.name,
                "url": image.file.url,
                "type": image.image_type,
                "description": image.description,
                "created_at": image.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
        })
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"上传失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@jwt_required
def get_image_list(request):
    """
    获取图片列表
    请求参数：
    - page: 页码（默认1）
    - page_size: 每页数量（默认20）
    - type: 图片类型（可选）
    - creator_id: 创建者ID（可选）
    """
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        image_type = request.GET.get('type')
        creator_id = request.GET.get('creator_id')

        # 构建查询
        query = Image.objects.all()
        if image_type:
            query = query.filter(image_type=image_type)
        if creator_id:
            query = query.filter(creator_id=creator_id)

        # 分页
        paginator = Paginator(query, page_size)
        images = paginator.page(page)

        # 构建响应数据
        image_list = []
        for image in images:
            image_list.append({
                "id": image.id,
                "name": image.name,
                "url": image.file.url,
                "type": image.image_type,
                "description": image.description,
                "created_at": image.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "creator": {
                    "id": image.creator.id,
                    "username": image.creator.username
                }
            })

        return Response({
            "code": 200,
            "message": "获取成功",
            "data": {
                "total": paginator.count,
                "page": page,
                "page_size": page_size,
                "images": image_list
            }
        })
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"获取失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@jwt_required
def get_image_detail(request, image_id):
    """获取图片详情"""
    try:
        image = image_service.get_image(image_id)
        if not image:
            return Response({
                "code": 404,
                "message": "图片不存在"
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "code": 200,
            "message": "获取成功",
            "data": {
                "id": image.id,
                "name": image.name,
                "url": image.file.url,
                "type": image.image_type,
                "description": image.description,
                "created_at": image.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "file_size": image.file_size,
                "file_extension": image.file_extension,
                "creator": {
                    "id": image.creator.id,
                    "username": image.creator.username
                }
            }
        })
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"获取失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@jwt_required
@permission_classes([IsAdminUser])
def update_image(request, image_id):
    """
    更新图片信息（仅管理员）
    请求参数：
    {
        "name": "新名称",
        "description": "新描述",
        "image_type": "新类型"
    }
    """
    try:
        image = image_service.update_image(
            image_id=image_id,
            name=request.data.get('name'),
            description=request.data.get('description'),
            image_type=request.data.get('image_type')
        )

        if not image:
            return Response({
                "code": 404,
                "message": "图片不存在"
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "code": 200,
            "message": "更新成功",
            "data": {
                "id": image.id,
                "name": image.name,
                "type": image.image_type,
                "description": image.description
            }
        })
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"更新失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@jwt_required
@permission_classes([IsAdminUser])
def delete_image(request, image_id):
    """删除图片（仅管理员）"""
    try:
        if image_service.delete_image(image_id):
            return Response({
                "code": 200,
                "message": "删除成功"
            })
        else:
            return Response({
                "code": 404,
                "message": "图片不存在"
            }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"删除失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@jwt_required
def get_user_type_image(request, user_id, image_type):
    """获取用户特定类型的最新图片"""
    try:
        image = image_service.get_image_by_type_and_user(
            image_type=image_type,
            user_id=user_id
        )

        if not image:
            return Response({
                "code": 404,
                "message": "未找到相关图片"
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "code": 200,
            "message": "获取成功",
            "data": {
                "id": image.id,
                "url": image.file.url,
                "created_at": image.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
        })
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"获取失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)