from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework import status
from .models import Builder
from .serializers import BuilderSerializer
from app.user.decorators import jwt_required
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from ..public.services import ImageService


@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def add_model(request):
    try:
        data = request.data.copy()
        user = request.auth_user
        data['creator'] = user.id

        if 'image' in request.FILES:
            image_service = ImageService()
            image = image_service.create_image(
                file=request.FILES['image'],
                creator_id=user.id,
                image_type='building',
                name=f"建筑图片-{data.get('name', '')}"
            )
            data['image'] = image.id  # 直接关联image对象

        print(data['tags'])

        serializer = BuilderSerializer(data=data)
        if serializer.is_valid():
            builder = serializer.save()
            serializer = BuilderSerializer(builder)  # 重新序列化保存后的对象
            return Response({
                "code": 200,
                "message": "创建成功",
                "data": serializer.data
            })
        return Response({
            "code": 400,
            "message": "参数错误",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"创建失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def update_model(request, pk):
    try:
        model = Builder.objects.get(pk=pk)
        if model.creator.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                "code": 403,
                "message": "无权限修改此建筑"
            }, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()

        if 'image' in request.FILES:
            image_service = ImageService()
            image = image_service.create_image(
                file=request.FILES['image'],
                creator_id=request.auth_user.id,
                image_type='building',
                name=f"建筑图片-{model.name}"
            )
            data['image'] = image.id

            # 删除旧图片
            if model.image:
                image_service.delete_image(model.image.id)

        serializer = BuilderSerializer(model, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "code": 200,
                "message": "更新成功",
                "data": serializer.data
            })
        return Response({
            "code": 400,
            "message": "参数错误",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Builder.DoesNotExist:
        return Response({
            "code": 404,
            "message": "建筑不存在"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"更新失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@jwt_required
def delete_model(request, pk):
    """删除建筑模型"""
    try:
        model = Builder.objects.get(pk=pk)

        # 权限检查
        if model.creator.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                "code": 403,
                "message": "无权限删除此建筑"
            }, status=status.HTTP_403_FORBIDDEN)

        # 删除关联图片
        if model.image_id:
            image_service = ImageService()
            image_service.delete_image(model.image_id)

        model.delete()
        return Response({
            "code": 200,
            "message": "删除成功"
        })
    except Builder.DoesNotExist:
        return Response({
            "code": 404,
            "message": "建筑不存在"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"删除失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@jwt_required
def get_my_models(request):
    """
    获取当前登录用户的建筑模型列表
    """
    queryset = Builder.objects.filter(creator=request.user).order_by('-created_at')

    # 添加分页
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)

    serializer = BuilderSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def get_all_buildings_paginated(request):
    """
    获取所有建筑模型列表
    """
    queryset = Builder.objects.all().order_by('-created_at')

    # 添加分页
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = BuilderSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def get_all_models(request):
    """
    获取所有建筑模型列表
    """
    try:
        queryset = Builder.objects.all().order_by('-created_at')
        serializer = BuilderSerializer(queryset, many=True)
        return Response(
            {"code": 200, "data": serializer.data},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"code": 500, "message": "Internal Server Error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@api_view(['GET'])
def get_building_categories(request):
    """
    获取建筑物分类的接口
    """
    categories = Builder.objects.values_list('category', flat=True).distinct()
    print(categories)
    return Response(categories, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_building_tags(request):
    """
    获取建筑物标签的接口, 每个建筑物标签的话呢都是字符串带有都好的,去重 返回生成数组
    """
    tags = Builder.objects.values_list('tags', flat=True)
    # ['测试标签2,测试标签1', '测试3,测试标签4']  转换成一个数组四个值
    tags = [tag.split(',') for tag in tags]

    tags = [tag for sublist in tags for tag in sublist]

    #去重
    tags = list(set(tags))





    print(tags)
    return Response(tags)