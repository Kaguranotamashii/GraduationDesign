from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework import status

from probject import settings
from .models import Builder
from .serializers import BuilderSerializer
from app.user.decorators import jwt_required
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .utils import save_building_image, delete_building_image, save_model_file


@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def add_model(request):
    """添加建筑模型"""
    try:
        data = request.data.copy()
        user = request.auth_user
        data['creator'] = user.id

        # 处理图片上传
        if 'image' in request.FILES:
            try:
                image_path = save_building_image(
                    request.FILES['image'],
                    name=f"建筑图片-{data.get('name', '')}"
                )
                data['image'] = image_path
            except ValueError as e:
                return Response({
                    "code": 400,
                    "message": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        serializer = BuilderSerializer(data=data)
        if serializer.is_valid():
            builder = serializer.save()
            return Response({
                "code": 200,
                "message": "创建成功",
                "data": BuilderSerializer(builder).data
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
    """更新建筑模型"""
    try:
        model = Builder.objects.get(pk=pk)
        if model.creator.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                "code": 403,
                "message": "无权限修改此建筑"
            }, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()

        # 处理图片更新
        if 'image' in request.FILES:
            try:
                # 删除旧图片
                if model.image:
                    delete_building_image(model.image)

                # 保存新图片
                image_path = save_building_image(
                    request.FILES['image'],
                    name=f"建筑图片-{model.name}"
                )
                data['image'] = image_path
            except ValueError as e:
                return Response({
                    "code": 400,
                    "message": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

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
        if model.creator.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                "code": 403,
                "message": "无权限删除此建筑"
            }, status=status.HTTP_403_FORBIDDEN)

        # 删除关联图片
        if model.image:
            delete_building_image(model.image)

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
def get_all_buildings_paginated(request):
    """获取所有建筑模型列表（分页）"""
    queryset = Builder.objects.all().order_by('-created_at')
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = BuilderSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def get_building_categories(request):
    """获取建筑物分类列表"""
    categories = Builder.objects.values_list('category', flat=True).distinct()
    return Response({
        "code": 200,
        "data": list(categories)
    })

@api_view(['GET'])
def get_building_tags(request):
    """获取所有建筑物标签"""
    tags = Builder.objects.values_list('tags', flat=True)
    # 处理标签
    all_tags = []
    for tag_str in tags:
        if tag_str:
            all_tags.extend([t.strip() for t in tag_str.split(',')])
    # 去重
    unique_tags = list(set(all_tags))
    return Response({
        "code": 200,
        "data": unique_tags
    })


@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def upload_model_file(request, pk):
    """上传建筑物模型文件"""
    try:
        builder = Builder.objects.get(pk=pk)

        # 权限检查
        if builder.creator.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                "code": 403,
                "message": "无权限修改此建筑"
            }, status=status.HTTP_403_FORBIDDEN)

        if 'model' not in request.FILES:
            return Response({
                "code": 400,
                "message": "请选择要上传的模型文件"
            }, status=status.HTTP_400_BAD_REQUEST)

        # 删除旧模型文件
        if builder.model:
            delete_model_file(builder.model.name)

        try:
            # 保存新模型文件
            model_path = save_model_file(
                request.FILES['model'],
                name=f"建筑模型-{builder.name}"
            )
            builder.model = model_path

            # 更新JSON数据（如果有）
            if 'json' in request.data:
                builder.json = request.data['json']

            builder.save()

            return Response({
                "code": 200,
                "message": "模型文件上传成功",
                "data": BuilderSerializer(builder).data
            })
        except ValueError as e:
            return Response({
                "code": 400,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    except Builder.DoesNotExist:
        return Response({
            "code": 404,
            "message": "建筑不存在"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"上传失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@jwt_required
def delete_model_file(request, pk):
    """删除建筑物模型文件"""
    try:
        builder = Builder.objects.get(pk=pk)

        # 权限检查
        if builder.creator.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                "code": 403,
                "message": "无权限修改此建筑"
            }, status=status.HTTP_403_FORBIDDEN)

        if not builder.model:
            return Response({
                "code": 400,
                "message": "没有模型文件"
            }, status=status.HTTP_400_BAD_REQUEST)

        # 删除模型文件
        delete_model_file(builder.model.name)
        builder.model = None
        builder.save()

        return Response({
            "code": 200,
            "message": "模型文件删除成功"
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

@api_view(['POST'])
@jwt_required
def update_model_json(request, pk):
    """更新建筑物模型的JSON数据"""
    try:
        builder = Builder.objects.get(pk=pk)

        # 权限检查
        if builder.creator.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                "code": 403,
                "message": "无权限修改此建筑"
            }, status=status.HTTP_403_FORBIDDEN)

        if 'json' not in request.data:
            return Response({
                "code": 400,
                "message": "请提供JSON数据"
            }, status=status.HTTP_400_BAD_REQUEST)

        builder.json = request.data['json']
        builder.save()

        return Response({
            "code": 200,
            "message": "JSON数据更新成功",
            "data": BuilderSerializer(builder).data
        })

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

@api_view(['GET'])
@jwt_required
def get_model_details(request, pk):
    """获取建筑物模型详细信息"""
    try:
        builder = Builder.objects.get(pk=pk)

        return Response({
            "code": 200,
            "message": "获取成功",
            "data": {
                "id": builder.id,
                "name": builder.name,
                "model_url": f"{settings.URL_BASE}/media/{builder.model}" if builder.model else None,
                "json": builder.json,
                "created_at": builder.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "updated_at": builder.updated_at.strftime("%Y-%m-%d %H:%M:%S")
            }
        })

    except Builder.DoesNotExist:
        return Response({
            "code": 404,
            "message": "建筑不存在"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"获取失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)