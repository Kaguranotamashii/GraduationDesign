from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.utils.timezone import make_aware

from .models import Comment
from .serializers import CommentSerializer
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Comment, CommentLike
from .serializers import CommentSerializer
from app.user.decorators import jwt_required, admin_required


@api_view(['POST'])
@jwt_required
@parser_classes([JSONParser])
def add_comment(request):
    data = request.data.copy()
    user = request.auth_user

    if not data.get('content'):
        return Response({
            'code': status.HTTP_400_BAD_REQUEST,
            'message': '评论内容不能为空'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not data.get('article'):
        return Response({
            'code': status.HTTP_400_BAD_REQUEST,
            'message': '文章ID不能为空'
        }, status=status.HTTP_400_BAD_REQUEST)

    # 确保 article 是整数
    try:
        article_id = int(data['article'])
        data['article'] = article_id
    except ValueError:
        return Response({
            'code': status.HTTP_400_BAD_REQUEST,
            'message': '文章ID格式错误'
        }, status=status.HTTP_400_BAD_REQUEST)

    data['author'] = user.id
    serializer = CommentSerializer(data=data)

    if serializer.is_valid():
        if data.get('parent'):
            try:
                parent = Comment.objects.get(id=data['parent'])
                if parent.article_id != article_id:  # 使用转换后的整数进行比较
                    return Response({
                        'code': status.HTTP_400_BAD_REQUEST,
                        'message': '父评论必须属于同一文章'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Comment.DoesNotExist:
                return Response({
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': '父评论不存在'
                }, status=status.HTTP_400_BAD_REQUEST)

        comment = serializer.save()
        return Response({
            'code': status.HTTP_201_CREATED,
            'message': '评论发布成功',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({
        'code': status.HTTP_400_BAD_REQUEST,
        'message': '参数错误',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def get_comments(request, article_id):
    try:
        queryset = Comment.objects.filter(article_id=article_id)
        serializer = CommentSerializer(queryset, many=True, context={'request': request})
        return Response({
            'code': status.HTTP_200_OK,
            'message': '获取评论列表成功',
            'data': serializer.data,
            'total': queryset.count()
        })
    except Exception as e:
        return Response({
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': '获取评论列表失败',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_replies(request, comment_id):
    try:
        comment = get_object_or_404(Comment, id=comment_id)
        queryset = Comment.objects.filter(parent_id=comment_id)
        serializer = CommentSerializer(queryset, many=True)
        return Response({
            'code': status.HTTP_200_OK,
            'message': '获取回复列表成功',
            'data': serializer.data,
            'total': queryset.count()
        })
    except Comment.DoesNotExist:
        return Response({
            'code': status.HTTP_404_NOT_FOUND,
            'message': '评论不存在'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@jwt_required
def delete_comment(request, pk):
    try:
        comment = get_object_or_404(Comment, pk=pk)

        # 检查权限：评论作者、文章作者或管理员可以删除
        if not (
                comment.author == request.auth_user or  # 评论作者
                comment.article.author == request.auth_user or  # 文章作者
                request.auth_user.is_staff  # 管理员
        ):
            return Response({
                'code': status.HTTP_403_FORBIDDEN,
                'message': '您没有权限删除此评论'
            }, status=status.HTTP_403_FORBIDDEN)

        comment.delete()  # 级联删除会自动处理子评论

        return Response({
            'code': status.HTTP_200_OK,
            'message': '评论删除成功'
        })
    except Comment.DoesNotExist:
        return Response({
            'code': status.HTTP_404_NOT_FOUND,
            'message': '评论不存在'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@jwt_required
def like_comment(request, pk):
    """给评论点赞"""
    try:
        comment = get_object_or_404(Comment, pk=pk)

        # 检查是否已经点赞
        like_record = CommentLike.objects.filter(
            comment=comment,
            user=request.auth_user
        ).first()

        if like_record:
            return Response({
                'code': 400,
                'message': '您已经点赞过这条评论了'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 创建点赞记录
        CommentLike.objects.create(
            comment=comment,
            user=request.auth_user
        )

        # 更新评论点赞数
        comment.likes = F('likes') + 1
        comment.save()
        comment.refresh_from_db()

        # 使用序列化器获取最新数据
        serializer = CommentSerializer(comment, context={'request': request})

        return Response({
            'code': 200,
            'message': '点赞成功',
            'data': serializer.data
        })
    except Comment.DoesNotExist:
        return Response({
            'code': 404,
            'message': '评论不存在'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'点赞失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_required
def unlike_comment(request, pk):
    """取消评论点赞"""
    try:
        comment = get_object_or_404(Comment, pk=pk)

        # 查找并删除点赞记录
        like_record = CommentLike.objects.filter(
            comment=comment,
            user=request.auth_user
        ).first()

        if not like_record:
            return Response({
                'code': 400,
                'message': '您还没有点赞过这条评论'
            }, status=status.HTTP_400_BAD_REQUEST)

        like_record.delete()

        # 更新评论点赞数
        comment.likes = F('likes') - 1
        comment.save()
        comment.refresh_from_db()

        # 使用序列化器获取最新数据
        serializer = CommentSerializer(comment, context={'request': request})

        return Response({
            'code': 200,
            'message': '取消点赞成功',
            'data': serializer.data
        })
    except Comment.DoesNotExist:
        return Response({
            'code': 404,
            'message': '评论不存在'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'取消点赞失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@jwt_required
def get_my_comments(request):
    """获取用户的评论列表"""
    try:
        queryset = Comment.objects.filter(author=request.auth_user)
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 10)
        search = request.query_params.get('search', '')

        if search:
            queryset = queryset.filter(content__icontains=search)

        paginator = PageNumberPagination()
        paginator.page_size = page_size
        page_data = paginator.paginate_queryset(queryset, request)

        serializer = CommentSerializer(page_data, many=True, context={'request': request})

        return Response({
            'code': status.HTTP_200_OK,
            'message': '获取评论列表成功',
            'data': serializer.data,
            'total': queryset.count()
        })
    except Exception as e:
        return Response({
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': '获取评论列表失败',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.utils.timezone import make_aware

from .models import Comment
from .serializers import CommentSerializer

@api_view(['GET'])
@jwt_required
@admin_required
def admin_comment_list(request):
    """管理员获取评论列表"""
    try:
        # 获取查询参数
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        search = request.GET.get('search', '')
        comment_status = request.GET.get('status', '')  # 改名避免与 status 模块冲突
        date_range = request.GET.getlist('date_range[]', [])

        # 构建查询条件
        queryset = Comment.objects.all().select_related('author', 'article')

        # 搜索条件
        if search:
            queryset = queryset.filter(
                Q(content__icontains=search) |
                Q(author__username__icontains=search)
            )

        # 状态筛选
        if comment_status == 'top':
            queryset = queryset.filter(is_top=True)
        elif comment_status == 'normal':
            queryset = queryset.filter(is_top=False)

        # 日期范围筛选
        if len(date_range) == 2:
            try:
                start_date = make_aware(datetime.strptime(date_range[0], '%Y-%m-%d'))
                end_date = make_aware(datetime.strptime(date_range[1], '%Y-%m-%d'))
                queryset = queryset.filter(created_at__range=[start_date, end_date])
            except ValueError:
                pass

        # 计算分页
        total = queryset.count()
        start = (page - 1) * page_size
        end = page * page_size
        comments = queryset[start:end]

        serializer = CommentSerializer(comments, many=True, context={'request': request})

        return Response({
            'code': 200,  # 使用数字而不是 status 常量
            'message': '获取评论列表成功',
            'data': serializer.data,
            'total': total
        })
    except Exception as e:
        return Response({
            'code': 500,  # 使用数字而不是 status 常量
            'message': f'获取评论列表失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@jwt_required
@admin_required
def admin_delete_comment(request, pk):
    """管理员删除单个评论"""
    try:
        comment = get_object_or_404(Comment, pk=pk)
        comment.delete()
        return Response({
            'code': 200,
            'message': '评论删除成功'
        })
    except Comment.DoesNotExist:
        return Response({
            'code': 404,
            'message': '评论不存在'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'删除评论失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_required
@admin_required
def admin_batch_delete_comments(request):
    """管理员批量删除评论"""
    try:
        comment_ids = request.data.get('ids', [])
        if not comment_ids:
            return Response({
                'code': 400,
                'message': '请选择要删除的评论'
            }, status=status.HTTP_400_BAD_REQUEST)

        Comment.objects.filter(id__in=comment_ids).delete()
        return Response({
            'code': 200,
            'message': '批量删除成功'
        })
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'批量删除失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_required
@admin_required
def admin_toggle_top_comment(request, pk):
    """管理员切换评论置顶状态"""
    try:
        comment = get_object_or_404(Comment, pk=pk)
        comment.is_top = not comment.is_top
        comment.save()
        return Response({
            'code': 200,
            'message': '更新置顶状态成功',
            'data': {
                'is_top': comment.is_top
            }
        })
    except Comment.DoesNotExist:
        return Response({
            'code': 404,
            'message': '评论不存在'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'code': 500,
            'message': f'更新置顶状态失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)