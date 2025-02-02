import re
import json
import random
import string
from django.core.cache import cache
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from app.user.decorators import jwt_required
from .models import CustomUser  # 确保使用继承AbstractUser的自定义用户模型
from probject.status_code import STATUS_MESSAGES, SUCCESS, ERROR, INVALID_PARAMS, UNAUTHORIZED
from rest_framework_simplejwt.tokens import RefreshToken

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
            "user":
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "avatar": user.avatar.url if user.avatar else None,
                    "signature": user.signature,
                    "register_time": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
                },
            "access_token": access_token,
            "refresh_token": str(refresh),
            "expires_in": 3600 * 24 * 30  # 秒
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
            "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
        })

    return Response(
        {
            "code": 200,
            "message": "获取用户列表成功",
            "data": user_list_data
        },
        status=status.HTTP_200_OK
    )



# 修改用户信息
