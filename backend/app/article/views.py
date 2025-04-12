from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import F, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone

from probject import settings
from .models import Article, ArticleLike
from .serializers import ArticleSerializer
from app.user.decorators import jwt_required, admin_required
from .utils import handle_uploaded_file, delete_file
from ..builder.models import Builder


class StandardResultsSetPagination(PageNumberPagination):
    """标准分页器"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def force_utf8_encoding(data):
    """确保所有字符串都转换为 UTF-8 编码"""
    if isinstance(data, str):
        return data.encode('utf-8').decode('utf-8')
    elif isinstance(data, dict):
        return {k: force_utf8_encoding(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [force_utf8_encoding(v) for v in data]
    return data

@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_article(request):
    """创建文章（可以是草稿或直接发布）"""
    try:
        data = force_utf8_encoding(request.data.copy())  # 统一编码为UTF-8
        data['author'] = request.auth_user.id

        # 调试日志
        print("接收到的原始数据:", request.data)
        print("状态字段:", request.data.get('status'))

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            cover_image_path = handle_uploaded_file(
                request.FILES['cover_image_file'],
                'articles/covers'
            )
            data['cover_image'] = cover_image_path

        # 验证状态值
        status_value = data.get('status', 'draft')
        if status_value not in ['draft', 'published']:
            return Response({
                'code': 400,
                'message': '无效的状态值',
                'received_status': status_value
            }, status=status.HTTP_400_BAD_REQUEST)

        # 确保状态字段存在
        data['status'] = status_value

        print("处理后的数据:", data)  # 调试日志

        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            print("验证后的数据:", serializer.validated_data)  # 调试日志

            article = serializer.save()

            # 根据状态设置相应的时间
            current_time = timezone.now()

            if article.status == 'published':
                article.published_at = current_time
                article.draft_saved_at = None  # 如果直接发布，清除草稿时间
            else:  # status == 'draft'
                article.draft_saved_at = current_time
                article.published_at = None  # 如果是草稿，清除发布时间

            article.save()

            return Response({
                'code': 200,
                'message': '文章创建成功',
                'status': article.status,  # 返回实际保存的状态
                'data': ArticleSerializer(article).data
            })

        return Response({
            'code': 400,
            'message': '数据验证失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"创建错误: {str(e)}")  # 错误日志
        return Response({
            'code': 500,
            'message': f'创建失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

@api_view(['PUT', 'PATCH'])
@jwt_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_article(request, article_id):
    try:
        article = get_object_or_404(Article, id=article_id)
        # 检查权限
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                'code': 403,
                'message': '没有权限修改此文章'
            }, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()

        # 处理 builder
        if 'builder' in data:
            try:
                # 直接使用 builder ID，不需要重命名为 builder_id
                builder_id = int(data['builder'])
                # 验证 builder 是否存在
                if not Builder.objects.filter(id=builder_id).exists():
                    return Response({
                        'code': 400,
                        'message': '指定的建筑不存在'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({
                    'code': 400,
                    'message': 'builder ID必须是一个有效的整数'
                }, status=status.HTTP_400_BAD_REQUEST)

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            if article.cover_image:
                delete_file(article.cover_image)
            cover_image_path = handle_uploaded_file(
                request.FILES['cover_image_file'],
                'articles/covers'
            )
            data['cover_image'] = cover_image_path

        # 在更新之前打印数据，用于调试
        print("更新数据:".encode('utf-8'), data)

        serializer = ArticleSerializer(article, data=data, partial=True)

        if serializer.is_valid():
            # 打印验证后的数据
            print("验证后的数据:".encode('utf-8'), serializer.validated_data)

            updated_article = serializer.save()

            # 如果状态发生变化
            if 'status' in data and data['status'] == 'published' and article.status == 'draft':
                updated_article.published_at = timezone.now()
                updated_article.save()

            return Response({
                'code': 200,
                'message': '文章更新成功',
                'data': ArticleSerializer(updated_article).data
            })

        return Response({
            'code': 400,
            'message': '数据验证失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"更新错误: {str(e).encode('utf-8')}")  # 添加错误日志
        return Response({
            'code': 500,
            'message': f'更新失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@jwt_required
def save_draft(request, article_id=None):
    """保存文章草稿（新建或更新）"""
    try:
        data = request.data.copy()
        data['author'] = request.auth_user.id
        data['status'] = 'draft'

        if article_id:
            # 更新现有草稿
            article = get_object_or_404(Article, id=article_id)

            # 检查权限
            if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
                return Response({
                    'code': 403,
                    'message': '没有权限修改此草稿'
                }, status=status.HTTP_403_FORBIDDEN)

            # 处理封面图片
            if 'cover_image_file' in request.FILES:
                if article.cover_image:
                    delete_file(article.cover_image)
                cover_image_path = handle_uploaded_file(
                    request.FILES['cover_image_file'],
                    'articles/covers'
                )
                data['cover_image'] = cover_image_path

            serializer = ArticleSerializer(article, data=data, partial=True)
        else:
            # 创建新草稿
            if 'cover_image_file' in request.FILES:
                cover_image_path = handle_uploaded_file(
                    request.FILES['cover_image_file'],
                    'articles/covers'
                )
                data['cover_image'] = cover_image_path

            serializer = ArticleSerializer(data=data)

        if serializer.is_valid():
            draft = serializer.save()
            draft.draft_saved_at = timezone.now()
            draft.save()

            return Response({
                'code': 200,
                'message': '草稿保存成功',
                'data': ArticleSerializer(draft).data
            })

        return Response({
            'code': 400,
            'message': '数据验证失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'code': 500,
            'message': f'保存草稿失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@jwt_required
def publish_draft(request, article_id):
    """将草稿发布为正式文章"""
    try:
        article = get_object_or_404(Article, id=article_id)

        # 检查权限
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                'code': 403,
                'message': '没有权限发布此草稿'
            }, status=status.HTTP_403_FORBIDDEN)

        # 检查是否为草稿状态
        if article.status != 'draft':
            return Response({
                'code': 400,
                'message': '只能发布草稿状态的文章'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 更新状态和发布时间
        article.status = 'published'
        article.published_at = timezone.now()
        article.save()

        return Response({
            'code': 200,
            'message': '文章发布成功',
            'data': ArticleSerializer(article).data
        })

    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'发布失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@jwt_required
def delete_article(request, article_id):
    """删除文章（草稿或已发布的文章）"""
    try:
        article = get_object_or_404(Article, id=article_id)

        # 检查权限
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return Response({
                'code': 403,
                'message': '没有权限删除此文章'
            }, status=status.HTTP_403_FORBIDDEN)

        # 删除封面图片
        if article.cover_image:
            delete_file(article.cover_image)

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
def get_article_list(request):
    paginator = StandardResultsSetPagination()
    queryset = filter_articles(request)

    page = paginator.paginate_queryset(queryset, request)
    serializer = ArticleSerializer(page, many=True, context={'request': request})  # 添加 context

    return paginator.get_paginated_response({
        'code': 200,
        'message': '获取文章列表成功',
        'data': serializer.data
    })


@api_view(['GET'])
def get_all_articles(request):
    """获取所有文章，不分页"""
    queryset = filter_articles(request)
    serializer = ArticleSerializer(queryset, many=True)

    return Response({
        'code': 200,
        'message': '获取文章列表成功',
        'data': serializer.data
    })


@api_view(['GET'])
@jwt_required
def get_drafts(request):
    """获取当前用户的草稿列表"""
    paginator = StandardResultsSetPagination()
    queryset = Article.objects.filter(
        author=request.auth_user,
        status='draft'
    ).order_by('-draft_saved_at')

    page = paginator.paginate_queryset(queryset, request)
    serializer = ArticleSerializer(page, many=True)

    return paginator.get_paginated_response({
        'code': 200,
        'message': '获取草稿列表成功',
        'data': serializer.data
    })


def filter_articles(request):
    """文章过滤通用方法"""
    status_filter = request.GET.get('status')
    search_query = request.GET.get('search')
    builder_id = request.GET.get('builder')
    tag = request.GET.get('tag')
    author_id = request.GET.get('author')

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

    return queryset


@api_view(['GET'])
def get_article_detail(request, article_id):
    try:
        article = get_object_or_404(Article, id=article_id)

        if article.status == 'published':
            article.views = F('views') + 1
            article.save()
            article.refresh_from_db()

        serializer = ArticleSerializer(article, context={'request': request})  # 添加 context
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
    """点赞文章（仅限已发布的文章）"""
    try:
        article = get_object_or_404(Article, id=article_id)

        # 只能给已发布的文章点赞
        if article.status != 'published':
            return Response({
                'code': 400,
                'message': '只能给已发布的文章点赞'
            }, status=status.HTTP_400_BAD_REQUEST)

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


@api_view(['GET'])
def get_featured_articles(request):
    """获取精选文章列表（仅已发布的文章）"""
    paginator = StandardResultsSetPagination()
    queryset = Article.objects.filter(is_featured=True, status='published')

    page = paginator.paginate_queryset(queryset, request)
    serializer = ArticleSerializer(page, many=True)

    return paginator.get_paginated_response({
        'code': 200,
        'message': '获取精选文章列表成功',
        'data': serializer.data
    })


@api_view(['GET'])
@jwt_required
def get_my_articles(request):
    """获取当前用户的文章列表（包括草稿和已发布）"""
    paginator = StandardResultsSetPagination()
    status_filter = request.GET.get('status')  # 可以筛选状态

    queryset = Article.objects.filter(author=request.auth_user)

    if status_filter and status_filter != 'all':
        queryset = queryset.filter(status=status_filter)

    queryset = queryset.order_by('-created_at')

    page = paginator.paginate_queryset(queryset, request)
    serializer = ArticleSerializer(page, many=True)

    return paginator.get_paginated_response({
        'code': 200,
        'message': '获取我的文章列表成功',
        'data': serializer.data
    })


@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def upload_image(request):
    """
    上传图片并返回图片URL

    请求参数:
    - image: 图片文件
    - folder: 可选，指定保存的文件夹，默认为 'images'

    返回:
    - 成功: {'code': 200, 'message': '上传成功', 'data': {'url': '完整图片URL'}}
    - 失败: {'code': 400/500, 'message': '错误信息'}
    """
    try:
        if 'image' not in request.FILES:
            return Response({
                'code': 400,
                'message': '请选择要上传的图片'
            }, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES['image']
        # 验证文件类型
        if not image_file.content_type.startswith('image/'):
            return Response({
                'code': 400,
                'message': '只能上传图片文件'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 获取保存文件夹，默认为 'images'
        folder = request.data.get('folder', 'images')

        # 处理文件上传
        image_path = handle_uploaded_file(image_file, folder)

        # 构建完整的URL
        image_url = f"{settings.URL_BASE}/{settings.MEDIA_URL.strip('/')}/{image_path}"

        return Response({
            'code': 200,
            'message': '图片上传成功',
            'data': {
                'url': image_url,
                'path': image_path  # 同时返回相对路径，以便后续使用
            }
        })
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'上传失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@jwt_required
def like_article(request, article_id):
    """给文章点赞"""
    try:
        article = get_object_or_404(Article, id=article_id)

        # 只能给已发布的文章点赞
        if article.status != 'published':
            return Response({
                'code': 400,
                'message': '只能给已发布的文章点赞'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 检查是否已经点赞
        like_record = ArticleLike.objects.filter(
            article=article,
            user=request.auth_user
        ).first()

        if like_record:
            return Response({
                'code': 400,
                'message': '您已经点赞过这篇文章了'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 创建点赞记录
        ArticleLike.objects.create(
            article=article,
            user=request.auth_user
        )

        # 更新文章点赞数
        article.likes = F('likes') + 1
        article.save()
        article.refresh_from_db()

        # 使用序列化器获取最新数据
        serializer = ArticleSerializer(article, context={'request': request})

        return Response({
            'code': 200,
            'message': '点赞成功',
            'data': serializer.data
        })
    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@jwt_required
def unlike_article(request, article_id):
    """取消文章点赞"""
    try:
        article = get_object_or_404(Article, id=article_id)

        # 查找并删除点赞记录
        like_record = ArticleLike.objects.filter(
            article=article,
            user=request.auth_user
        ).first()

        if not like_record:
            return Response({
                'code': 400,
                'message': '您还没有点赞过这篇文章'
            }, status=status.HTTP_400_BAD_REQUEST)

        like_record.delete()

        # 更新文章点赞数
        article.likes = F('likes') - 1
        article.save()
        article.refresh_from_db()

        # 使用序列化器获取最新数据
        serializer = ArticleSerializer(article, context={'request': request})

        return Response({
            'code': 200,
            'message': '取消点赞成功',
            'data': serializer.data
        })
    except Article.DoesNotExist:
        return Response({
            'code': 404,
            'message': '文章不存在'
        }, status=status.HTTP_404_NOT_FOUND)

# 获取热度前十的文章，根据点赞和浏览量计算
@api_view(['GET'])
def get_top_articles(request):
    try:
        # 计算热度得分
        articles = Article.objects.annotate(
            score=(F('likes') + F('views')) * 0.5
        ).order_by('-score')[:10]
        for article in articles:
            article.content = article.content[:30]
        serializer = ArticleSerializer(articles, many=True)
        return Response({
            'code': 200,
           'message': '获取热度前十的文章成功',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'code': 500,
           'message': f'获取失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_article_list_v2(request):
    # 默认获取所有已发布文章，而不是过滤
    articles = Article.objects.filter(status='published').order_by('-created_at')  # 添加排序

    # 获取查询参数并进行过滤
    title = request.query_params.get('title')
    content = request.query_params.get('content')
    author = request.query_params.get('author')
    tags = request.query_params.get('tags')

    # 只在有值时才进行过滤
    if title and title.strip():
        articles = articles.filter(title__icontains=title.strip())
    if content and content.strip():
        articles = articles.filter(content__icontains=content.strip())
    if author and author.strip():
        articles = articles.filter(author__username__icontains=author.strip())
    if tags!= 'undefined' and tags.strip():
        tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        if tags_list:
            query = Q()
            for tag in tags_list:
                query |= Q(tags__icontains=tag)
            articles = articles.filter(query)

    # 添加调试日志
    print(f"Query parameters: {request.query_params}")
    print(f"Article count before pagination: {articles.count()}")

    # 分页
    paginator = StandardResultsSetPagination()
    paginated_articles = paginator.paginate_queryset(articles, request)

    # 截取内容
    for article in paginated_articles:
        if article.content:
            article.content = article.content[:30]

    serializer = ArticleSerializer(paginated_articles, many=True)

    response_data = {
        'code': 200,
        'message': '获取文章列表成功',
        'data': {
            'count': articles.count(),
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': serializer.data
        }
    }

    print(f"Response data: {response_data}")  # 调试日志
    return Response(response_data)



#获取全部标签，注意每个文章的标签都是一个带有逗号分隔的字符串
@api_view(['GET'])
def get_all_tags(request):
    """获取所有文章标签（去重，仅包含已发布文章）"""
    try:
        # 获取所有已发布文章的标签
        articles = Article.objects.filter(status='published')
        tags = set()

        for article in articles:
            if article.tags:
                # 清理并分割标签
                cleaned_tags = [tag.strip() for tag in article.tags.split(',') if tag.strip()]
                tags.update(cleaned_tags)

        # 按字母顺序排序
        sorted_tags = sorted(tags)

        return Response({
            'code': 200,
            'message': '获取标签成功',
            'data': sorted_tags
        })

    except Exception as e:
        return Response({
            'code': 500,
            'message': f'获取标签失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





@api_view(['POST'])
@jwt_required
@admin_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_create_article(request):
    """管理员创建文章"""
    try:
        data = request.data.copy()
        data['author'] = request.auth_user.id  # 默认使用管理员作为作者

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            cover_image_path = handle_uploaded_file(
                request.FILES['cover_image_file'],
                'articles/covers'
            )
            data['cover_image'] = cover_image_path

        # 设置默认值
        if 'status' not in data:
            data['status'] = 'draft'

        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            article = serializer.save()

            # 处理时间字段
            current_time = timezone.now()
            if article.status == 'published':
                article.published_at = current_time
            else:
                article.draft_saved_at = current_time

            article.save()

            return Response({
                'code': 200,
                'message': '文章创建成功',
                'data': ArticleSerializer(article).data
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




@api_view(['GET'])
@jwt_required
@admin_required
def admin_get_all_articles(request):
    try:
        paginator = StandardResultsSetPagination()

        # 获取过滤参数
        status_filter = request.GET.get('status')
        search_query = request.GET.get('search')

        queryset = Article.objects.all().order_by('-created_at')


        # 应用过滤
        if status_filter and status_filter not in ['all', 'undefined', None]:
            queryset = queryset.filter(status=status_filter)

        if search_query and search_query != 'undefined':
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(content__icontains=search_query)
            )
        page = paginator.paginate_queryset(queryset, request)
        serializer = ArticleSerializer(page, many=True, context={'request': request})

        # 返回标准分页响应
        return paginator.get_paginated_response(serializer.data)

    except Exception as e:
        return Response({
            'code': 500,
            'message': f'获取失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['PUT', 'PATCH'])
@jwt_required
@admin_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_update_article(request, article_id):
    """管理员更新文章"""
    try:
        article = get_object_or_404(Article, id=article_id)
        data = request.data.copy()

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            if article.cover_image:
                delete_file(article.cover_image)
            cover_image_path = handle_uploaded_file(
                request.FILES['cover_image_file'],
                'articles/covers'
            )
            data['cover_image'] = cover_image_path

        serializer = ArticleSerializer(article, data=data, partial=True)

        if serializer.is_valid():
            updated_article = serializer.save()

            # 处理状态变更
            if 'status' in data:
                current_time = timezone.now()
                if data['status'] == 'published' and article.status != 'published':
                    updated_article.published_at = current_time
                    updated_article.draft_saved_at = None
                elif data['status'] == 'draft':
                    updated_article.draft_saved_at = current_time

            updated_article.save()

            return Response({
                'code': 200,
                'message': '文章更新成功',
                'data': ArticleSerializer(updated_article).data
            })

        return Response({
            'code': 400,
            'message': '数据验证失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'code': 500,
            'message': f'更新失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@jwt_required
@admin_required
def admin_delete_article(request, article_id):
    """管理员删除文章"""
    try:
        article = get_object_or_404(Article, id=article_id)

        # 删除关联的点赞记录
        ArticleLike.objects.filter(article=article).delete()

        # 删除封面图片
        if article.cover_image:
            delete_file(article.cover_image)

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