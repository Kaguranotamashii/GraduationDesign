import logging
import os
import re
import json
import random
import string
import uuid
from datetime import datetime

from django.contrib.messages.storage import default_storage
from django.core.cache import cache
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.db.models import Q
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from app.user.decorators import jwt_required, admin_required
from probject import settings
from .models import CustomUser  # 确保使用继承AbstractUser的自定义用户模型
from probject.status_code import STATUS_MESSAGES, SUCCESS, ERROR, INVALID_PARAMS, UNAUTHORIZED
from rest_framework_simplejwt.tokens import RefreshToken
from app.public.services import ImageService
from .utils import validate_image, delete_file, save_image

# 验证码有效期配置
VERIFICATION_CODE_EXPIRE = 600  # 10分钟（单位：秒）

# 密码强度正则验证
PASSWORD_REGEX = re.compile(
    r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$'
)


@api_view(['POST'])
def send_verification_email(request):
    """
    发送验证码邮件（POST方式）
    请求参数：{"email": "user@example.com"}
    """
    data = request.data  # 使用 DRF 提供的 request.data
    email = data.get('email')

    # 参数校验
    if not email:
        return Response(
            {"code": 400, "message": "邮箱不能为空"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 邮箱格式验证
    if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
        return Response(
            {"code": 400, "message": "邮箱格式不正确"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 生成验证码
    verification_code = ''.join(random.choices(string.digits, k=6))
    print(f"验证码：{verification_code} 邮箱 :{email}")

    # 存储到缓存
    cache_key = f'verify:{email}'
    cache.set(cache_key, verification_code, VERIFICATION_CODE_EXPIRE)

    # 渲染邮件模板
    subject = '邮箱验证码'
    html_message = render_to_string(
        'emails/registration_email.html',
        {'email': email, 'verification_code': verification_code}
    )

    # 发送邮件
    print(email)
    email = EmailMessage(subject, html_message, to=[email])
    email.content_subtype = 'html'
    email.send()

    return Response(
        {"code": 200, "message": "验证码发送成功"},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def register_user(request):
    """
    用户注册接口
    请求参数：
    {
        "username": "testuser",
        "password": "Test@123",
        "email": "test@example.com",
        "code": "123456"
    }
    """
    data = request.data  # 使用 DRF 提供的 request.data
    print(data)
    username = data.get('username', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').lower().strip()
    code = data.get('code', '')

    # # 参数校验
    # if not all([username, password, email, code]):
    #     return Response(
    #         {"code": 400, "message": "缺少必填字段"},
    #         status=status.HTTP_400_BAD_REQUEST
    #     )
    #
    # # 用户名规范检查
    # if not re.match(r'^[a-zA-Z0-9]{4,20}$', username):
    #     return Response(
    #         {"code": 400, "message": "用户名需为4-20位字母数字组合"},
    #         status=status.HTTP_400_BAD_REQUEST
    #     )
    #
    # # 邮箱格式验证
    # if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
    #     return Response(
    #         {"code": 400, "message": "邮箱格式不正确"},
    #         status=status.HTTP_400_BAD_REQUEST
    #     )
    print('测试1')
    # 验证码校验
    cache_key = f'verify:{email}'
    cached_code = cache.get(cache_key)
    if not cached_code or cached_code != code:
        return Response(
            {"code": 400, "message": "验证码错误或已过期"},
            status=status.HTTP_400_BAD_REQUEST
        )
    print('测试2')
    # 检查用户唯一性
    if CustomUser.objects.filter(username__iexact=username).exists():
        return Response(
            {"code": 400, "message": "用户名已被注册"},
            status=status.HTTP_400_BAD_REQUEST
        )
    print('测试3')
    if CustomUser.objects.filter(email__iexact=email).exists():
        return Response(
            {"code": 400, "message": "邮箱已被注册"},
            status=status.HTTP_400_BAD_REQUEST
        )
    print('测试')
    # 创建用户
    try:
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password
        )
    except Exception as e:
        return Response(
            {"code": 500, "message": f"用户创建失败：{str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # 清除验证码
    cache.delete(cache_key)

    # 返回成功响应
    return Response(
        {
            "code": 200,
            "message": "注册成功",
            "data": {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "register_time": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def login_user(request):
    """
    用户登录接口（支持用户名/邮箱+密码）
    请求示例：
    {
        "identifier": "test@example.com 或 username",
        "password": "your_password"
    }
    """
    try:
        # 使用 DRF 提供的 request.data 解析请求体
        data = request.data
        identifier = data.get('identifier', '').strip()
        password = data.get('password', '')

        # 参数校验
        if not identifier or not password:
            return Response(
                {"code": 400, "message": "用户名/邮箱和密码不能为空"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 安全增强：暴力破解防护（可选）
        cache_key = f"login_failures:{identifier}"
        failures = cache.get(cache_key, 0)
        if failures >= 5:
            return Response(
                {"code": 429, "message": "尝试次数过多，请10分钟后再试"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # 验证登录方式
        user = None
        if '@' in identifier:
            if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', identifier):
                return Response(
                    {"code": 400, "message": "邮箱格式不正确"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                user = CustomUser.objects.get(email=identifier)
            except CustomUser.DoesNotExist:
                pass
        else:
            if len(identifier) < 4:
                return Response(
                    {"code": 400, "message": "用户名至少4位"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                user = CustomUser.objects.get(username=identifier)
            except CustomUser.DoesNotExist:
                pass

        # 用户未找到
        if not user:
            return Response(
                {"code": 401, "message": "用户名/邮箱不存在"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 验证密码
        if not user.check_password(password):
            # 增加失败次数
            cache.set(cache_key, failures + 1, timeout=600)
            return Response(
                {"code": 401, "message": "密码错误"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 重置失败次数
        cache.delete(cache_key)

        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # 存储登录状态（示例：记录设备登录）
        device_id = request.META.get('HTTP_X_DEVICE_ID', 'default')
        cache.set(f"user:{user.id}:{device_id}", access_token, timeout=3600 * 24 * 30)

        # 构造响应数据
        user_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar": user.get_full_avatar_url(),  # 修改这里
                "signature": user.signature,
                "register_time": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
            },
            "access_token": access_token,
            "refresh_token": str(refresh),
            "expires_in": 3600 * 24 * 30
        }

        return Response(
            {
                "code": 200,
                "message": "登录成功",
                "data": user_data
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        # 生产环境应记录日志
        print(f"登录异常: {str(e)}")
        return Response(
            {"code": 500, "message": "系统服务异常"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@jwt_required
def logout_user(request):
    """登出接口（需要携带有效JWT）"""
    try:
        # 获取设备ID（支持多设备）
        device_id = request.META.get('HTTP_X_DEVICE_ID', 'default')

        # 将令牌加入黑名单（剩余有效期+缓冲）
        token = request.auth_token
        try:
            payload = RefreshToken(token).payload
            exp_time = payload['exp'] - payload['iat'] + 60  # 增加60秒缓冲
        except Exception as e:
            return Response(
                {"code": 400, "message": "无效的令牌"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cache.set(f'blacklist:{token}', '1', timeout=exp_time)

        # 删除设备登录状态（可选）
        cache.delete(f'user:{request.auth_user.id}:{device_id}')

        return Response(
            {
                "code": 200,
                "message": "登出成功"
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                "code": 500,
                "message": "登出操作失败"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def user_list(request):
    """获取用户列表接口（需要管理员权限）"""
    # 检查用户是否具有管理员权限（示例：通过 request.auth_user.is_staff）
    if not request.auth_user.is_staff:
        return Response(
            {"code": 403, "message": "无权限访问"},
            status=status.HTTP_403_FORBIDDEN
        )

    # 获取所有用户
    users = CustomUser.objects.all()

    # 构造响应数据
    user_list_data = []
    for user in users:
        user_list_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_active": user.is_active,
            "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
            "avatar": user.get_full_avatar_url(),  # 修改这里
        })

    return Response(
        {
            "code": 200,
            "message": "获取用户列表成功",
            "data": user_list_data
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@jwt_required
def get_user_profile(request):
    """获取用户个人信息"""
    #这里需要加一个判断这个应该是本人或者管理员才能操作
    if not request.auth_user.is_staff:
        if request.auth_user.id != request.user.id:
            return Response(
                {"code": 403, "message": "无权限访问"},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(
            {"code": 403, "message": "无权限访问"},
            status=status.HTTP_403_FORBIDDEN
        )

    user = request.auth_user
    profile_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "signature": user.signature,
        "is_staff": user.is_staff,

        "avatar": user.get_full_avatar_url(),  # 修改这里
        "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
        "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else None
    }
    return Response({"code": 200, "message": "获取成功", "data": profile_data})


@api_view(['POST'])
@jwt_required
def update_user_profile(request):
    """更新用户个人信息"""
    user = request.auth_user
    data = request.data

    # 定义允许更新的字段列表
    allowed_fields = ['signature']
    updated_fields = {}

    # 更新允许的字段
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
            updated_fields[field] = data[field]

    try:
        user.save()
        # 返回完整的用户信息
        return Response({
            "code": 200,
            "message": "更新成功",
            "data": {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "avatar": user.get_full_avatar_url(),
                    "signature": user.signature,
                    "is_staff": user.is_staff,
                    "register_time": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        })
    except Exception as e:
        logging.error(f"更新用户信息失败: {str(e)}")
        return Response({
            "code": 500,
            "message": f"更新失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_required
def change_password(request):
    """修改密码"""
    user = request.auth_user
    data = request.data

    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not user.check_password(old_password):
        return Response({
            "code": 400,
            "message": "原密码错误"
        }, status=status.HTTP_400_BAD_REQUEST)

    # # 密码强度验证
    # if not PASSWORD_REGEX.match(new_password):
    #     return Response({
    #         "code": 400,
    #         "message": "密码必须包含字母、数字和特殊字符，长度8-20位"
    #     }, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    # 清除所有登录会话
    cache.delete_pattern(f"user:{user.id}:*")

    return Response({
        "code": 200,
        "message": "密码修改成功，请重新登录"
    })

@api_view(['POST'])
@jwt_required
def upload_avatar(request):
    """上传头像"""
    try:
        user = request.auth_user
        if 'avatar' not in request.FILES:
            return Response({
                "code": 400,
                "message": "请选择要上传的头像"
            }, status=status.HTTP_400_BAD_REQUEST)

        avatar_file = request.FILES['avatar']

        # 验证图片
        is_valid, error_msg = validate_image(avatar_file)
        if not is_valid:
            return Response({
                "code": 400,
                "message": error_msg
            }, status=status.HTTP_400_BAD_REQUEST)

        # 删除旧头像
        delete_file(user.avatar)

        # 保存新头像
        success, result, error = save_image(avatar_file, 'avatars')
        if not success:
            return Response({
                "code": 500,
                "message": f"头像保存失败: {result}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 更新用户头像路径
        user.avatar = result
        user.save()

        return Response({
            "code": 200,
            "message": "头像上传成功",
            "data": {
                "avatar_url": user.get_full_avatar_url()
            }
        })

    except Exception as e:
        return Response({
            "code": 500,
            "message": f"头像上传失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@jwt_required
def delete_avatar(request):
    """删除头像"""
    try:
        user = request.auth_user
        if not user.avatar:
            return Response({
                "code": 400,
                "message": "当前没有头像"
            }, status=status.HTTP_400_BAD_REQUEST)

        # 删除头像文件
        if delete_file(user.avatar):
            user.avatar = None
            user.save()
            return Response({
                "code": 200,
                "message": "头像删除成功"
            })
        else:
            return Response({
                "code": 500,
                "message": "头像删除失败"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            "code": 500,
            "message": f"操作失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_required
def refresh_auth_token(request):
    """刷新认证令牌"""
    refresh_token = request.data.get('refresh_token')
    if not refresh_token:
        return Response({
            "code": 400,
            "message": "缺少刷新令牌"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            "code": 200,
            "message": "令牌刷新成功",
            "data": {
                "access_token": str(refresh.access_token)
            }
        })
    except Exception as e:
        return Response({
            "code": 401,
            "message": "无效的刷新令牌"
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@jwt_required
def get_active_sessions(request):
    """获取当前用户的活跃会话"""
    user = request.auth_user
    pattern = f"user:{user.id}:*"
    sessions = []

    for key in cache.keys(pattern):
        device_id = key.split(':')[-1]
        sessions.append({
            "device_id": device_id,
            "last_active": cache.get(key)
        })

    return Response({
        "code": 200,
        "message": "获取成功",
        "data": sessions
    })


@api_view(['POST'])
@jwt_required
def revoke_session(request):
    """撤销指定的会话"""
    user = request.auth_user
    device_id = request.data.get('device_id')

    if not device_id:
        return Response({
            "code": 400,
            "message": "缺少设备ID"
        }, status=status.HTTP_400_BAD_REQUEST)

    cache_key = f"user:{user.id}:{device_id}"
    if cache.delete(cache_key):
        return Response({
            "code": 200,
            "message": "会话已撤销"
        })
    else:
        return Response({
            "code": 404,
            "message": "未找到指定会话"
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@jwt_required
@permission_classes([IsAdminUser])
def user_detail(request, user_id):
    """获取指定用户详细信息（管理员接口）"""
    try:
        user = CustomUser.objects.get(id=user_id)
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
            "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else None,
            "signature": user.signature,
            "avatar": user.get_full_avatar_url()  # 修改这里
        }
        return Response({
            "code": 200,
            "message": "获取成功",
            "data": user_data
        })
    except CustomUser.DoesNotExist:
        return Response({
            "code": 404,
            "message": "用户不存在"
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@jwt_required
@permission_classes([IsAdminUser])
def update_user_status(request, user_id):
    """更新用户状态（管理员接口）"""
    try:
        user = CustomUser.objects.get(id=user_id)
        data = request.data

        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_staff' in data:
            user.is_staff = data['is_staff']

        user.save()
        return Response({
            "code": 200,
            "message": "状态更新成功"
        })
    except CustomUser.DoesNotExist:
        return Response({
            "code": 404,
            "message": "用户不存在"
        }, status=status.HTTP_404_NOT_FOUND)


from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID


@api_view(['POST'])
def google_login(request):
    """
    Google登录处理
    请求参数：{
        "credential": "Google ID token"
    }
    """
    print(request.data)
    try:
        credential = request.data.get('credential')
        if not credential:
            return Response({
                'code': 400,
                'message': '缺少必要参数'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 验证Google ID token
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        print(idinfo)

        # 获取用户信息
        google_user_id = idinfo['sub']
        email = idinfo.get('email')
        name = idinfo.get('name')
        picture = idinfo.get('picture')

        # 检查用户是否已存在
        user = CustomUser.objects.filter(email=email).first()
        if not user:
            # 创建新用户
            username = f'google_{google_user_id}'
            # 检查用户名是否已存在
            while CustomUser.objects.filter(username=username).exists():
                username = f'google_{google_user_id}_{random.randint(1000, 9999)}'

            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=None  # 使用OAuth登录的用户不需要密码
            )
            user.name = name
            # 如果需要，可以下载并保存Google头像
            # user.avatar = picture
            user.save()

        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'code': 200,
            'message': '登录成功',
            'data': {
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': name,
                    'avatar': picture or user.get_full_avatar_url(),  # 修改这里
                },
                'access_token': access_token,
                'refresh_token': str(refresh),
            }
        })

    except ValueError:
        # Invalid token
        return Response({
            'code': 400,
            'message': '无效的Google令牌'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Google login error: {str(e)}")
        return Response({
            'code': 500,
            'message': '登录失败，请稍后重试'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#根据token获取当前token的信息
@api_view(['GET'])
@jwt_required
def get_current_user(request):
    """获取当前登录用户的信息"""
    try:
        print(request.auth_user)
        user = request.auth_user
        return Response({
            "code": 200,
            "message": "获取成功",
            "data": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "name": user.username,
                "avatar": user.get_full_avatar_url(),  # 修改这里
                "is_active": user.is_active,
                "is_staff": user.is_staff,
                "signature": user.signature,
                "register_time" : user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),


            }
        })
    except Exception as e:
        return Response({
            "code": 500,
            "message": "获取失败",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@jwt_required
@admin_required
def admin_user_list(request):
    """
    管理员获取用户列表（支持分页和搜索）
    GET /api/user/admin/users/?page=1&page_size=10&search=xxx
    """
    print("Current user:", request.auth_user)
    print("Is staff:", request.auth_user.is_staff)
    print("Is superuser:", request.auth_user.is_superuser)
    try:
        # 获取查询参数
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        search = request.GET.get('search', '')

        # 构建查询条件
        query = CustomUser.objects.all()
        if search:
            query = query.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search)
            )

        # 计算总数
        total = query.count()

        # 分页
        start = (page - 1) * page_size
        end = page * page_size
        users = query[start:end]

        # 构造响应数据
        user_list = []
        for user in users:
            user_list.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_staff": user.is_staff,
                "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else None,
                "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
                "avatar": user.get_full_avatar_url(),
                "signature": user.signature
            })

        return Response({
            "code": 200,
            "message": "获取成功",
            "data": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "users": user_list
            }
        })
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"获取用户列表失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@jwt_required
@admin_required
def admin_delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        is_superuser = request.auth_user.is_superuser

        # 非超级管理员不能删除管理员
        if not is_superuser and user.is_staff:
            return Response({
                "code": 403,
                "message": "只有超级管理员可以删除管理员账号"
            }, status=status.HTTP_403_FORBIDDEN)

        # 不能删除超级管理员
        if user.is_superuser:
            return Response({
                "code": 403,
                "message": "不能删除超级管理员账号"
            }, status=status.HTTP_403_FORBIDDEN)

        if user.avatar:
            delete_file(user.avatar)
        user.delete()

        return Response({
            "code": 200,
            "message": "用户删除成功"
        })
    except CustomUser.DoesNotExist:
        return Response({
            "code": 404,
            "message": "用户不存在"
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@jwt_required
@admin_required
def admin_update_user(request, user_id):
    """管理员更新用户信息"""
    try:
        user = CustomUser.objects.get(id=user_id)
        data = request.data
        is_superuser = request.auth_user.is_superuser

        # 非超级管理员不能修改管理员信息
        if not is_superuser and user.is_staff:
            return Response({
                "code": 403,
                "message": "只有超级管理员可以修改管理员信息"
            }, status=status.HTTP_403_FORBIDDEN)

        # 可更新的字段
        allowed_fields = ['is_active', 'signature']

        # 只有超级管理员可以修改 is_staff 字段
        if is_superuser:
            allowed_fields.append('is_staff')

        # 更新字段
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])

        user.save()
        return Response({
            "code": 200,
            "message": "用户信息更新成功",
            "data": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "signature": user.signature,
                "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else None,
                "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
            }
        })
    except CustomUser.DoesNotExist:
        return Response({
            "code": 404,
            "message": "用户不存在"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"更新用户信息失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_required
@permission_classes([IsAdminUser])
def admin_reset_user_password(request, user_id):
    """
    管理员重置用户密码
    POST /api/user/admin/users/{user_id}/reset-password/
    """
    try:
        user = CustomUser.objects.get(id=user_id)
        new_password = request.data.get('new_password')

        if not new_password:
            return Response({
                "code": 400,
                "message": "新密码不能为空"
            }, status=status.HTTP_400_BAD_REQUEST)

        # 不允许修改超级管理员密码
        if user.is_superuser and request.auth_user.id != user.id:
            return Response({
                "code": 403,
                "message": "不能修改超级管理员密码"
            }, status=status.HTTP_403_FORBIDDEN)

        # 设置新密码
        user.set_password(new_password)
        user.save()

        # 清除用户所有登录会话
        cache.delete_pattern(f"user:{user.id}:*")

        return Response({
            "code": 200,
            "message": "密码重置成功"
        })
    except CustomUser.DoesNotExist:
        return Response({
            "code": 404,
            "message": "用户不存在"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "code": 500,
            "message": f"密码重置失败: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)