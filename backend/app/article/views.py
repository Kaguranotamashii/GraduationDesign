from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from probject import settings
from .models import Article, ArticleLike
from .serializers import ArticleSerializer
from app.user.decorators import jwt_required, admin_required
from .utils import handle_uploaded_file, delete_file
from ..builder.models import Builder
import logging

# 配置日志
logger = logging.getLogger(__name__)

# 分页配置
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# 工具函数：确保数据为 UTF-8 编码
def force_utf8_encoding(data):
    """递归处理数据，确保字符串为 UTF-8 编码"""
    if isinstance(data, str):
        return data.encode('utf-8').decode('utf-8')
    elif isinstance(data, dict):
        return {k: force_utf8_encoding(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [force_utf8_encoding(v) for v in data]
    return data

# 工具函数：统一响应格式
def standard_response(code, message, data=None, errors=None):
    """生成标准 API 响应"""
    response = {'code': code, 'message': message}
    if data is not None:
        response['data'] = data
    if errors is not None:
        response['errors'] = errors
    return Response(response, status=code)

# 工具函数：文章过滤
def filter_articles(request, queryset=None):
    """根据请求参数过滤文章，普通用户只看到已发布文章"""
    if queryset is None:
        queryset = Article.objects.all()

    status_filter = request.GET.get('status')
    search_query = request.GET.get('search')
    builder_id = request.GET.get('builder')
    tag = request.GET.get('tag')
    author_id = request.GET.get('author')

    # 普通用户只能看到 published 文章
    if not request.auth_user or not request.auth_user.is_staff:
        queryset = queryset.filter(status='published')

    # 管理员可按状态过滤
    if status_filter and status_filter != 'all' and request.auth_user and request.auth_user.is_staff:
        queryset = queryset.filter(status=status_filter)

    if search_query:
        queryset = queryset.filter(Q(title__icontains=search_query) | Q(content__icontains=search_query))
    if builder_id:
        queryset = queryset.filter(builder_id=builder_id)
    if tag:
        queryset = queryset.filter(tags__icontains=tag)
    if author_id:
        queryset = queryset.filter(author_id=author_id)

    return queryset.order_by('-created_at')

# 普通用户视图

@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_article(request):
    """创建文章（普通用户创建草稿或提交审核）"""
    try:
        data = force_utf8_encoding(request.data.copy())
        data['author'] = request.auth_user.id
        status_value = data.get('status', 'draft')

        # 验证状态
        valid_statuses = ['draft', 'reviewing']
        if request.auth_user.is_staff:
            valid_statuses.extend(['review_failed', 'published'])

        if status_value not in valid_statuses:
            logger.warning(f"用户 {request.auth_user.id} 提交无效状态: {status_value}")

            return standard_response(400, '无效的状态值', errors={'status': status_value})

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            cover_image_path = handle_uploaded_file(request.FILES['cover_image_file'], 'articles/covers')
            data['cover_image'] = cover_image_path

        # 处理建筑
        if 'builder' in data and data['builder']:
            try:
                builder_id = int(data['builder'])
                if not Builder.objects.filter(id=builder_id).exists():
                    return standard_response(400, '指定的建筑不存在')
            except (ValueError, TypeError):
                return standard_response(400, '建筑 ID 必须是有效整数')

        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            article = serializer.save()
            logger.info(f"文章创建成功: ID {article.id}, 用户 {request.auth_user.id}, 状态: {article.status}")
            return standard_response(200, '文章创建成功', ArticleSerializer(article).data)

        return standard_response(400, '数据验证失败', errors=serializer.errors)

    except Exception as e:
        logger.error(f"文章创建失败: {str(e)}")
        return standard_response(500, f'创建失败: {str(e)}')

@api_view(['GET'])
def get_article_list(request):
    """获取文章列表（分页，普通用户只看到已发布文章）"""
    try:
        paginator = StandardResultsSetPagination()
        queryset = filter_articles(request)
        page = paginator.paginate_queryset(queryset, request)
        serializer = ArticleSerializer(page, many=True, context={'request': request})
        logger.info(f"用户 {getattr(request.auth_user, 'id', '匿名')} 获取文章列表")
        return paginator.get_paginated_response({
            'code': 200,
            'message': '获取文章列表成功',
            'data': serializer.data
        })

    except Exception as e:
        logger.error(f"获取文章列表失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

@api_view(['GET'])
def get_all_articles(request):
    """获取所有文章（不分页，普通用户只看到已发布文章）"""
    try:
        queryset = filter_articles(request)
        serializer = ArticleSerializer(queryset, many=True, context={'request': request})
        logger.info(f"用户 {getattr(request.auth_user, 'id', '匿名')} 获取所有文章")
        return standard_response(200, '获取文章列表成功', serializer.data)

    except Exception as e:
        logger.error(f"获取所有文章失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

@api_view(['GET'])
def get_article_detail(request, article_id):
    """获取文章详情（普通用户只看到已发布文章）"""
    try:
        article = get_object_or_404(Article, id=article_id)
        if article.status != 'published' and (not request.auth_user or not request.auth_user.is_staff):
            return standard_response(403, '无权限查看此文章')

        if article.status == 'published':
            article.views = F('views') + 1
            article.save()
            article.refresh_from_db()

        serializer = ArticleSerializer(article, context={'request': request})
        logger.info(f"文章详情获取成功: ID {article_id}")
        return standard_response(200, '获取文章详情成功', serializer.data)

    except Exception as e:
        logger.error(f"获取文章详情失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

@api_view(['PUT', 'PATCH'])
@jwt_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_article(request, article_id):
    """更新文章（普通用户只能更新草稿或审核失败文章）"""
    try:
        article = get_object_or_404(Article, id=article_id)
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return standard_response(403, '没有权限修改此文章')

        if not request.auth_user.is_staff and article.status not in ['draft', 'review_failed']:
            return standard_response(400, '只能修改草稿或审核失败的文章')

        data = force_utf8_encoding(request.data.copy())
        status_value = data.get('status', article.status)

        # 验证状态
        valid_statuses = ['draft', 'reviewing']
        if request.auth_user.is_staff:
            valid_statuses.extend(['review_failed', 'published'])

        if status_value not in valid_statuses:
            logger.warning(f"用户 {request.auth_user.id} 更新无效状态: {status_value}")
            return standard_response(400, '无效的状态值', errors={'status': status_value})

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            if article.cover_image:
                delete_file(article.cover_image)
            cover_image_path = handle_uploaded_file(request.FILES['cover_image_file'], 'articles/covers')
            data['cover_image'] = cover_image_path

        # 处理建筑
        if 'builder' in data and data['builder']:
            try:
                builder_id = int(data['builder'])
                if not Builder.objects.filter(id=builder_id).exists():
                    return standard_response(400, '指定的建筑不存在')
            except (ValueError, TypeError):
                return standard_response(400, '建筑 ID 必须是有效整数')

        serializer = ArticleSerializer(article, data=data, partial=True)
        if serializer.is_valid():
            updated_article = serializer.save()
            logger.info(f"文章更新成功: ID {article_id}, 用户 {request.auth_user.id}")
            return standard_response(200, '文章更新成功', ArticleSerializer(updated_article).data)

        return standard_response(400, '数据验证失败', errors=serializer.errors)

    except Exception as e:
        logger.error(f"文章更新失败: {str(e)}")
        return standard_response(500, f'更新失败: {str(e)}')

@api_view(['DELETE'])
@jwt_required
def delete_article(request, article_id):
    """删除文章（仅作者或管理员）"""
    try:
        article = get_object_or_404(Article, id=article_id)
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return standard_response(403, '没有权限删除此文章')

        if article.cover_image:
            delete_file(article.cover_image)
        article.delete()
        logger.info(f"文章删除成功: ID {article_id}, 用户 {request.auth_user.id}")
        return standard_response(200, '文章删除成功')

    except Exception as e:
        logger.error(f"文章删除失败: {str(e)}")
        return standard_response(500, f'删除失败: {str(e)}')

@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def save_draft(request, article_id=None):
    """保存或更新草稿"""
    try:
        data = force_utf8_encoding(request.data.copy())
        data['author'] = request.auth_user.id
        data['status'] = 'draft'

        if article_id:
            article = get_object_or_404(Article, id=article_id)
            if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
                return standard_response(403, '没有权限修改此草稿')
            if article.status not in ['draft', 'review_failed']:
                return standard_response(400, '只能修改草稿或审核失败的文章')
            serializer = ArticleSerializer(article, data=data, partial=True)
        else:
            serializer = ArticleSerializer(data=data)

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            if article_id and article.cover_image:
                delete_file(article.cover_image)
            cover_image_path = handle_uploaded_file(request.FILES['cover_image_file'], 'articles/covers')
            data['cover_image'] = cover_image_path

        if serializer.is_valid():
            draft = serializer.save()
            logger.info(f"草稿保存成功: ID {draft.id}, 用户 {request.auth_user.id}")
            return standard_response(200, '草稿保存成功', ArticleSerializer(draft).data)

        return standard_response(400, '数据验证失败', errors=serializer.errors)

    except Exception as e:
        logger.error(f"草稿保存失败: {str(e)}")
        return standard_response(500, f'保存草稿失败: {str(e)}')

@api_view(['POST'])
@jwt_required
def submit_draft(request, article_id):
    """提交草稿审核（普通用户）或直接发布（管理员）"""
    try:
        article = get_object_or_404(Article, id=article_id)
        if article.author.id != request.auth_user.id and not request.auth_user.is_staff:
            return standard_response(403, '没有权限提交此草稿')
        if article.status not in ['draft', 'review_failed']:
            return standard_response(400, '只能提交草稿或审核失败的文章')

        if request.auth_user.is_staff:
            article.status = 'published'
        else:
            article.status = 'reviewing'

        article.save()
        msg = '文章提交审核成功' if not request.auth_user.is_staff else '文章发布成功'
        logger.info(f"草稿提交/发布成功: ID {article_id}, 用户 {request.auth_user.id}, 状态: {article.status}")
        return standard_response(200, msg, ArticleSerializer(article).data)

    except Exception as e:
        logger.error(f"草稿提交失败: {str(e)}")
        return standard_response(500, f'提交失败: {str(e)}')

@api_view(['GET'])
@jwt_required
def get_drafts(request):
    """获取用户草稿列表"""
    try:
        paginator = StandardResultsSetPagination()
        queryset = Article.objects.filter(
            author=request.auth_user,
            status__in=['draft', 'review_failed']
        ).order_by('-draft_saved_at')
        page = paginator.paginate_queryset(queryset, request)
        serializer = ArticleSerializer(page, many=True, context={'request': request})
        logger.info(f"用户 {request.auth_user.id} 获取草稿列表")
        return paginator.get_paginated_response({
            'code': 200,
            'message': '获取草稿列表成功',
            'data': serializer.data
        })

    except Exception as e:
        logger.error(f"获取草稿列表失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

@api_view(['POST'])
@jwt_required
def like_article(request, article_id):
    """点赞文章（仅已发布文章）"""
    try:
        article = get_object_or_404(Article, id=article_id)
        if article.status != 'published':
            return standard_response(400, '只能给已发布的文章点赞')

        like_record = ArticleLike.objects.filter(article=article, user=request.auth_user).first()
        if like_record:
            return standard_response(400, '您已经点赞过这篇文章')

        ArticleLike.objects.create(article=article, user=request.auth_user)
        article.likes = F('likes') + 1
        article.save()
        article.refresh_from_db()
        logger.info(f"文章点赞成功: ID {article_id}, 用户 {request.auth_user.id}")
        return standard_response(200, '点赞成功', ArticleSerializer(article, context={'request': request}).data)

    except Exception as e:
        logger.error(f"点赞失败: {str(e)}")
        return standard_response(500, f'点赞失败: {str(e)}')

@api_view(['POST'])
@jwt_required
def unlike_article(request, article_id):
    """取消点赞文章"""
    try:
        article = get_object_or_404(Article, id=article_id)
        like_record = ArticleLike.objects.filter(article=article, user=request.auth_user).first()
        if not like_record:
            return standard_response(400, '您还没有点赞过这篇文章')

        like_record.delete()
        article.likes = F('likes') - 1
        article.save()
        article.refresh_from_db()
        logger.info(f"取消点赞成功: ID {article_id}, 用户 {request.auth_user.id}")
        return standard_response(200, '取消点赞成功', ArticleSerializer(article, context={'request': request}).data)

    except Exception as e:
        logger.error(f"取消点赞失败: {str(e)}")
        return standard_response(500, f'取消点赞失败: {str(e)}')

@api_view(['GET'])
def get_featured_articles(request):
    """获取精选文章列表（仅已发布文章）"""
    try:
        paginator = StandardResultsSetPagination()
        queryset = Article.objects.filter(is_featured=True, status='published')
        page = paginator.paginate_queryset(queryset, request)
        serializer = ArticleSerializer(page, many=True, context={'request': request})
        logger.info(f"用户 {getattr(request.user, 'id', '匿名')} 获取精选文章")
        return paginator.get_paginated_response({
            'code': 200,
            'message': '获取精选文章列表成功',
            'data': serializer.data
        })

    except Exception as e:
        logger.error(f"获取精选文章失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

@api_view(['GET'])
@jwt_required
def get_my_articles(request):
    """获取用户自己的文章列表（包括草稿、审核中、审核失败、已发布）"""
    try:
        paginator = StandardResultsSetPagination()
        queryset = Article.objects.filter(author=request.user)  # 修复：request.auser 改为 request.user
        status_filter = request.GET.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        queryset = queryset.order_by('-created_at')
        page = paginator.paginate_queryset(queryset, request)
        serializer = ArticleSerializer(page, many=True, context={'request': request})

        return paginator.get_paginated_response({
            'code': 200,
            'message': '获取我的文章列表成功',
            'data': serializer.data
        })
    except Exception as e:
        logger.error(f"获取我的文章失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')
@api_view(['POST'])
@jwt_required
@parser_classes([MultiPartParser, FormParser])
def upload_image(request):
    """上传图片"""
    try:
        if 'image' not in request.FILES:
            return standard_response(400, '请选择要上传的图片')

        image_file = request.FILES['image']
        if not image_file.content_type.startswith('image/'):
            return standard_response(400, '只能上传图片文件')

        folder = request.data.get('folder', 'images')
        image_path = handle_uploaded_file(image_file, folder)
        image_url = f"{settings.URL_BASE}/{settings.MEDIA_URL.strip('/')}/{image_path}"
        logger.info(f"图片上传成功: URL {image_url}, 用户 {request.user.id}")
        return standard_response(200, '图片上传成功', {'url': image_url, 'path': image_path})

    except Exception as e:
        logger.error(f"图片上传失败: {str(e)}")
        return standard_response(500, f'上传失败: {str(e)}')

@api_view(['GET'])
def get_top_articles(request):
    """获取热门文章（前10，基于点赞和浏览量）"""
    try:

        print("测试" + str(request.user))
        articles = Article.objects.filter(status='published').annotate(
            score=(F('likes') + F('views')) * 0.5
        ).order_by('-score')[:10]
        for article in articles:
            article.content = article.content[:30]
        serializer = ArticleSerializer(articles, many=True, context={'request': request})
        logger.info(f"用户 {getattr(request, 'id', '匿名')} 获取热门文章")
        return standard_response(200, '获取热门文章成功', serializer.data)

    except Exception as e:
        logger.error(f"获取热门文章失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

@api_view(['GET'])
def get_all_tags(request):
    """获取所有标签（去重，仅已发布文章）"""
    try:
        articles = Article.objects.filter(status='published')
        tags = set()
        for article in articles:
            if article.tags:
                cleaned_tags = [tag.strip() for tag in article.tags.split(',') if tag.strip()]
                tags.update(cleaned_tags)
        sorted_tags = sorted(tags)
        logger.info(f"用户 {getattr(request.user, 'id', '匿名')} 获取标签")
        return standard_response(200, '获取标签成功', sorted_tags)

    except Exception as e:
        logger.error(f"获取标签失败: {str(e)}")
        return standard_response(500, f'获取标签失败: {str(e)}')

@api_view(['GET'])
def search_articles(request):
    """搜索文章（分页，仅已发布文章）"""
    try:
        articles = Article.objects.filter(status='published').order_by('-created_at')
        title = request.query_params.get('title')
        content = request.query_params.get('content')
        author = request.query_params.get('author')
        tags = request.query_params.get('tags')

        if title and title.strip():
            articles = articles.filter(title__icontains=title.strip())
        if content and content.strip():
            articles = articles.filter(content__icontains=content.strip())
        if author and author.strip():
            articles = articles.filter(author__username__icontains=author.strip())
        if tags and tags != 'undefined' and tags.strip():
            tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            if tags_list:
                query = Q()
                for tag in tags_list:
                    query |= Q(tags__icontains=tag)
                articles = articles.filter(query)

        logger.debug(f"搜索参数: {request.query_params}, 文章数量: {articles.count()}")

        paginator = StandardResultsSetPagination()
        paginated_articles = paginator.paginate_queryset(articles, request)
        for article in paginated_articles:
            if article.content:
                article.content = article.content[:30]
        serializer = ArticleSerializer(paginated_articles, many=True, context={'request': request})

        return standard_response(200, '获取文章列表成功', {
            'count': articles.count(),
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': serializer.data
        })

    except Exception as e:
        logger.error(f"搜索文章失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

# 管理员视图

@api_view(['POST'])
@jwt_required
@admin_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_create_article(request):
    """管理员创建文章（可直接发布）"""
    try:
        data = force_utf8_encoding(request.data.copy())
        data['author'] = request.auth_user.id
        if 'status' not in data:
            data['status'] = 'draft'

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            cover_image_path = handle_uploaded_file(request.FILES['cover_image_file'], 'articles/covers')
            data['cover_image'] = cover_image_path

        # 处理建筑
        if 'builder' in data and data['builder']:
            try:
                builder_id = int(data['builder'])
                if not Builder.objects.filter(id=builder_id).exists():
                    return standard_response(400, '指定的建筑不存在')
            except (ValueError, TypeError):
                return standard_response(400, '建筑 ID 必须是有效整数')

        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            article = serializer.save()
            logger.info(f"管理员创建文章成功: ID {article.id}, 用户 {request.auth_user.id}")
            return standard_response(200, '文章创建成功', ArticleSerializer(article).data)

        return standard_response(400, '数据验证失败', errors=serializer.errors)

    except Exception as e:
        logger.error(f"管理员创建文章失败: {str(e)}")
        return standard_response(500, f'创建失败: {str(e)}')

@api_view(['GET'])
@jwt_required
@admin_required
def admin_get_all_articles(request):
    """管理员获取所有文章（分页）"""
    try:
        paginator = StandardResultsSetPagination()
        queryset = Article.objects.all().order_by('-created_at')
        status_filter = request.GET.get('status')
        search_query = request.GET.get('search')

        if status_filter and status_filter not in ['all', 'undefined', None]:
            queryset = queryset.filter(status=status_filter)
        if search_query and search_query != 'undefined':
            queryset = queryset.filter(Q(title__icontains=search_query) | Q(content__icontains=search_query))

        page = paginator.paginate_queryset(queryset, request)
        serializer = ArticleSerializer(page, many=True, context={'request': request})
        logger.info(f"管理员 {request.auth_user.id} 获取所有文章")
        return paginator.get_paginated_response({
            'code': 200,
            'message': '获取文章列表成功',
            'data': serializer.data
        })

    except Exception as e:
        logger.error(f"管理员获取文章失败: {str(e)}")
        return standard_response(500, f'获取失败: {str(e)}')

@api_view(['PUT', 'PATCH'])
@jwt_required
@admin_required
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_update_article(request, article_id):
    """管理员更新文章（包括内容和状态）"""
    try:
        article = get_object_or_404(Article, id=article_id)
        data = force_utf8_encoding(request.data.copy())

        # 处理封面图片
        if 'cover_image_file' in request.FILES:
            if article.cover_image:
                delete_file(article.cover_image)
            cover_image_path = handle_uploaded_file(request.FILES['cover_image_file'], 'articles/covers')
            data['cover_image'] = cover_image_path

        # 处理建筑
        if 'builder' in data and data['builder']:
            try:
                builder_id = int(data['builder'])
                if not Builder.objects.filter(id=builder_id).exists():
                    return standard_response(400, '指定的建筑不存在')
            except (ValueError, TypeError):
                return standard_response(400, '建筑 ID 必须是有效整数')

        serializer = ArticleSerializer(article, data=data, partial=True)
        if serializer.is_valid():
            updated_article = serializer.save()
            logger.info(f"管理员更新文章成功: ID {article_id}, 用户 {request.auth_user.id}")
            return standard_response(200, '文章更新成功', ArticleSerializer(updated_article).data)

        return standard_response(400, '数据验证失败', errors=serializer.errors)

    except Exception as e:
        logger.error(f"管理员更新文章失败: {str(e)}")
        return standard_response(500, f'更新失败: {str(e)}')

@api_view(['DELETE'])
@jwt_required
@admin_required
def admin_delete_article(request, article_id):
    """管理员删除文章"""
    try:
        article = get_object_or_404(Article, id=article_id)
        ArticleLike.objects.filter(article=article).delete()
        if article.cover_image:
            delete_file(article.cover_image)
        article.delete()
        logger.info(f"管理员删除文章成功: ID {article_id}, 用户 {request.auth_user.id}")
        return standard_response(200, '文章删除成功')

    except Exception as e:
        logger.error(f"管理员删除文章失败: {str(e)}")
        return standard_response(500, f'删除失败: {str(e)}')

@api_view(['POST'])
@jwt_required
@admin_required
def admin_review_article(request, article_id):
    """管理员审批文章（设为已发布或审核失败）"""
    try:
        article = get_object_or_404(Article, id=article_id)
        if article.status != 'reviewing':
            return standard_response(400, '只能审批审核中的文章')

        new_status = request.data.get('status')
        if new_status not in ['published', 'review_failed']:
            return standard_response(400, '无效的审批状态', errors={'status': new_status})

        article.status = new_status
        article.save()
        logger.info(f"文章审批成功: ID {article_id}, 用户 {request.auth_user.id}, 新状态: {new_status}")
        return standard_response(200, '文章审批成功', ArticleSerializer(article).data)

    except Exception as e:
        logger.error(f"文章审批失败: {str(e)}")
        return standard_response(500, f'审批失败: {str(e)}')