from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import F
from django.shortcuts import get_object_or_404

from .models import Comment
from .serializers import CommentSerializer
from app.user.decorators import jwt_required
@api_view(['POST'])
@jwt_required
@parser_classes([JSONParser])
def add_comment(request):
    """
    添加评论（POST方式）
    请求参数: {
        "article": 文章ID,
        "content": "评论内容",
        "parent": 父评论ID(可选,用于回复)
    }
    """
    data = request.data.copy()
    data['author'] = request.user.id

    serializer = CommentSerializer(data=data)
    if serializer.is_valid():
        if data.get('parent'):
            parent = get_object_or_404(Comment, id=data['parent'])
            if parent.article_id != data['article']:
                return Response({'error': '父评论必须属于同一文章'}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_comments(request, article_id):
    """
    获取文章评论列表（GET方式）
    路径参数: article_id 文章ID
    返回带分页的评论列表,只返回顶层评论(没有父评论的评论)
    """
    queryset = Comment.objects.filter(article_id=article_id, parent=None)
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = CommentSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def get_replies(request, comment_id):
    """
    获取评论回复列表（GET方式）
    路径参数: comment_id 评论ID
    返回指定评论下的所有回复
    """
    queryset = Comment.objects.filter(parent_id=comment_id)
    serializer = CommentSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@jwt_required
def delete_comment(request, pk):
    """
    删除评论（DELETE方式）
    路径参数: pk 评论ID
    仅评论作者和管理员可删除
    """
    comment = get_object_or_404(Comment, pk=pk)
    if comment.author != request.user and not request.user.is_staff:
        return Response({'error': '没有权限'}, status=status.HTTP_403_FORBIDDEN)
    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@jwt_required
def like_comment(request, pk):
    """
    点赞评论（POST方式）
    路径参数: pk 评论ID
    需要登录认证
    """
    comment = get_object_or_404(Comment, pk=pk)
    comment.likes = F('likes') + 1
    comment.save()
    return Response({'status': '成功'})