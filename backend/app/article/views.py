from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import F, Q
from django.shortcuts import get_object_or_404

from .models import Article
from .serializers import ArticleSerializer
from app.user.decorators import jwt_required
from ..public.services import ImageService


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_article(request):
    """创建文章"""
    try:
        data = request.data.copy()
        data['author'] = request.auth_user.id

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            image_service = ImageService()
            cover_image = image_service.create_image(
                file=request.FILES['cover_image_file'],
                creator_id=request.auth_user.id,
                image_type='article',
                name=f"文章封面-{data.get('title', '')}"
            )
            data['cover_image'] = cover_image.id

        # 处理内容图片
        if 'content_image_files' in request.FILES:
            image_service = ImageService()
            content_image_ids = []

            for image_file in request.FILES.getlist('content_image_files'):
                content_image = image_service.create_image(
                    file=image_file,
                    creator_id=request.auth_user.id,
                    image_type='article',
                    name=f"文章内容图片-{data.get('title', '')}"
                )
                content_image_ids.append(str(content_image.id))

            data['content_images'] = ','.join(content_image_ids)

        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'code': 200,
                'message': '文章创建成功',
                'data': serializer.data
            })
        return Response({
            'code': 400,
            'message': '数据验证失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'创建失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@jwt_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_article(request, article_id):
    """更新文章"""
    try:
        article = Article.objects.get(id=article_id)

        # 检查权限
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                'code': 403,
                'message': '没有权限修改此文章'
            }, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        image_service = ImageService()

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            # 删除旧的封面图片
            if article.cover_image:
                image_service.delete_image(article.cover_image)

            # 创建新的封面图片
            cover_image = image_service.create_image(
                file=request.FILES['cover_image_file'],
                creator_id=request.auth_user.id,
                image_type='article',
                name=f"文章封面-{article.title}"
            )
            data['cover_image'] = cover_image.id

        # 处理内容图片
        if 'content_image_files' in request.FILES:
            # 删除旧的内容图片
            if article.content_images:
                for image_id in article.content_images.split(','):
                    try:
                        image_service.delete_image(int(image_id))
                    except:
                        pass

            # 创建新的内容图片
            content_image_ids = []
            for image_file in request.FILES.getlist('content_image_files'):
                content_image = image_service.create_image(
                    file=image_file,
                    creator_id=request.auth_user.id,
                    image_type='article',
                    name=f"文章内容图片-{article.title}"
                )
                content_image_ids.append(str(content_image.id))
            data['content_images'] = ','.join(content_image_ids)

        serializer = ArticleSerializer(article, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'code': 200,
                'message': '文章更新成功',
                'data': serializer.data
            })
        return Response({
            'code': 400,
            'message': '数据验证失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'更新失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@jwt_required
def delete_article(request, article_id):
    """删除文章"""
    try:
        article = Article.objects.get(id=article_id)

        # 检查权限
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                'code': 403,
                'message': '没有权限删除此文章'
            }, status=status.HTTP_403_FORBIDDEN)

        image_service = ImageService()

        # 删除封面图片
        if article.cover_image:
            image_service.delete_image(article.cover_image)

        # 删除内容图片
        if article.content_images:
            for image_id in article.content_images.split(','):
                try:
                    image_service.delete_image(int(image_id))
                except:
                    pass

        article.delete()
        return Response({
            'code': 200,
            'message': '文章删除成功'
        })
    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'删除失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_all_articles(request):
    """获取所有文章，不分页"""
    # 查询参数处理
    status_filter = request.GET.get('status')
    search_query = request.GET.get('search')
    builder_id = request.GET.get('builder')
    tag = request.GET.get('tag')
    author_id = request.GET.get('author')

    # 构建查询
    queryset = Article.objects.all()

    # 默认只显示已发布的文章，除非特别指定状态
    if not status_filter:
        queryset = queryset.filter(status='published')
    elif status_filter != 'all':
        queryset = queryset.filter(status=status_filter)

    # 搜索标题和内容
    if search_query:
        queryset = queryset.filter(
            Q(title__icontains=search_query) |
            Q(content__icontains=search_query)
        )

    # 按建筑筛选
    if builder_id:
        queryset = queryset.filter(builder_id=builder_id)

    # 按标签筛选
    if tag:
        queryset = queryset.filter(tags__icontains=tag)

    # 按作者筛选
    if author_id:
        queryset = queryset.filter(author_id=author_id)

    serializer = ArticleSerializer(queryset, many=True)

    return Response({
        'code': 200,
        'message': '获取文章列表成功',
        'data': serializer.data
    })

@api_view(['GET'])
def get_article_list(request):
    """获取文章列表，支持分页和过滤"""
    paginator = StandardResultsSetPagination()

    # 查询参数处理
    status_filter = request.GET.get('status')
    search_query = request.GET.get('search')
    builder_id = request.GET.get('builder')
    tag = request.GET.get('tag')
    author_id = request.GET.get('author')

    # 构建查询
    queryset = Article.objects.all()

    # 默认只显示已发布的文章，除非特别指定状态
    if not status_filter:
        queryset = queryset.filter(status='published')
    elif status_filter != 'all':
        queryset = queryset.filter(status=status_filter)

    # 搜索标题和内容
    if search_query:
        queryset = queryset.filter(
            Q(title__icontains=search_query) |
            Q(content__icontains=search_query)
        )

    # 按建筑筛选
    if builder_id:
        queryset = queryset.filter(builder_id=builder_id)

    # 按标签筛选
    if tag:
        queryset = queryset.filter(tags__icontains=tag)

    # 按作者筛选
    if author_id:
        queryset = queryset.filter(author_id=author_id)

    # 执行分页
    page = paginator.paginate_queryset(queryset, request)
    serializer = ArticleSerializer(page, many=True)

    return paginator.get_paginated_response({
        'code': 200,
        'message': '获取文章列表成功',
        'data': serializer.data
    })

@api_view(['GET'])
def get_article_detail(request, article_id):
    """获取文章详情"""
    try:
        article = Article.objects.get(id=article_id)
        # 增加浏览量
        article.views = F('views') + 1
        article.save()
        article.refresh_from_db()

        serializer = ArticleSerializer(article)
        return Response({
            'code': 200,
            'message': '获取文章详情成功',
            'data': serializer.data
        })
    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@jwt_required
def like_article(request, article_id):
    """点赞文章"""
    try:
        article = Article.objects.get(id=article_id)
        article.likes = F('likes') + 1
        article.save()
        article.refresh_from_db()

        return Response({
            'code': 200,
            'message': '点赞成功',
            'data': {'likes': article.likes}
        })
    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@jwt_required
def toggle_featured(request, article_id):
    """设置/取消精选文章（仅管理员）"""
    # 检查是否是管理员
    if not request.user.is_staff:
        return Response({
            'code': 403,
            'message': '只有管理员可以设置精选文章'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        article = Article.objects.get(id=article_id)
        article.is_featured = not article.is_featured
        article.save()

        return Response({
            'code': 200,
            'message': f"{'设置' if article.is_featured else '取消'}精选成功",
            'data': {'is_featured': article.is_featured}
        })
    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_featured_articles(request):
    """获取精选文章列表"""
    paginator = StandardResultsSetPagination()
    queryset = Article.objects.filter(is_featured=True, status='published')

    page = paginator.paginate_queryset(queryset, request)
    serializer = ArticleSerializer(page, many=True)

    return paginator.get_paginated_response({
        'code': 200,
        'message': '获取精选文章列表成功',
        'data': serializer.data
    })


