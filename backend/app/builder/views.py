from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Builder
from .serializers import BuilderSerializer
from app.user.decorators import jwt_required
from rest_framework.pagination import PageNumberPagination
@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def add_model(request):
    """
    添加建筑模型的接口
    必需字段：name, description, address, category
    文件字段：image（可选）, model（可选）
    JSON 数据字段：json（可选）
    MD文档 text
    """
    # 将当前登录用户作为创建者加入数据
    data = request.data.copy()
    data['creator'] = request.user.id

    serializer = BuilderSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




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
def  get_all_buildings_paginated(request):
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
    queryset = Builder.objects.all().order_by('-created_at')
    serializer = BuilderSerializer(queryset, many=True)
    return Response(serializer.data)



# 删除模型
@api_view(['DELETE'])
@jwt_required
def delete_model(request, pk):
    try:
        model = Builder.objects.get(pk=pk)
        if model.creator == request.user:
            model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'You do not have permission to delete this model.'}, status=status.HTTP_403_FORBIDDEN)
    except Builder.DoesNotExist:
        return Response({'error': 'Model not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'error': 'An error occurred while deleting the model.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def update_model(request, pk):
    try:
        model = Builder.objects.get(pk=pk)
        if model.creator == request.user:
            serializer = BuilderSerializer(model, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'You do not have permission to update this model.'}, status=status.HTTP_403_FORBIDDEN)
    except Builder.DoesNotExist:
        return Response({'error': 'Model not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'error': 'An error occurred while updating the model.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




