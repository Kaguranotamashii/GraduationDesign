
import json
import string
import uuid
from datetime import datetime, timedelta

from django.core.mail import send_mail
from django.http import JsonResponse
from django.core.files.base import ContentFile

from probject import settings
from .decorators import custom_login_required
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from probject.utils import response_json
from probject.status_code import SUCCESS, ERROR, INVALID_PARAMS
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
import random

from .strategy.EmailLoginStrategy import EmailLoginStrategy
from .strategy.LoginContext import LoginContext
from .strategy.UsernameLoginStrategy import UsernameLoginStrategy


# 生成6位数字验证码
def generate_verification_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

# 发送验证码邮件并存储验证码
def send_verification_email(request):
    email = request.GET.get('email')

    if not email:
        return JsonResponse({'error': 'Email parameter is missing'}, status=400)

    # 生成验证码
    verification_code = generate_verification_code()

    # 将验证码存储在Redis中，设置有效期为1小时
    cache.set(email, verification_code, timeout=3600)  # timeout为3600秒（1小时）

    subject = "神乐古建筑平台 邮箱验证码"
    message = f"您的邮箱验证码是：{verification_code}。\n该验证码将在1小时内有效，请尽快使用。"
    from_email = settings.EMAIL_HOST_USER

    try:
        send_mail(subject, message, from_email, [email])
        return JsonResponse({'message': 'Verification code sent successfully.'}, status=200)
    except Exception as e:
        return JsonResponse({'error': 'Failed to send email: ' + str(e)}, status=500)


@api_view(['POST'])
def register_user(request):
    """
    注册用户接口
    """
    try:
        # 解析 JSON 请求体
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的 JSON 格式'}, status=400)

        # 获取请求参数
        username = data.get('username')

        # 这里用户名不能出现特殊符号比如@
        if not username or '@' in username:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的用户名'}, status=400)
        password = data.get('password')
        email = data.get('email')
        verification_code = data.get('verification_code')  # 假设验证码已经包含在请求体中

        print("用户名:", username)
        print("密码:", password)
        print("邮箱:", email)

        # 参数校验
        if not username or not password or not email or not verification_code:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '缺少必填字段'}, status=400)

        # 校验邮箱格式
        if '@' not in email:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的邮箱地址'}, status=400)

        # 检查用户名是否已被注册
        if User.objects.filter(username=username).exists():
            return JsonResponse({'code': ERROR, 'message': '用户名已存在'}, status=400)

        # 检查邮箱是否已被注册
        if User.objects.filter(email=email).exists():
            return JsonResponse({'code': ERROR, 'message': '邮箱已被注册'}, status=400)

        # 校验验证码（从 Redis 获取并验证）
        stored_code = cache.get(email)
        if not stored_code:
            return JsonResponse({'code': ERROR, 'message': '验证码已过期或未发送'}, status=400)

        if verification_code != stored_code:
            return JsonResponse({'code': ERROR, 'message': '验证码不正确'}, status=400)

        # 创建用户并存储到数据库
        hashed_password = make_password(password)  # 对密码加密
        user = User.objects.create(
            username=username,
            password=hashed_password,
            email=email,
        )

        # 删除验证码，避免重复使用
        cache.delete(email)

        return JsonResponse(
            {'code': SUCCESS, 'data': {'username': user.username, 'email': user.email}, 'message': '用户注册成功'},
            status=201)

    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f'用户注册失败: {str(e)}'}, status=500)

def custom_authenticate(username, password):
    """
    自定义用户验证函数
    """
    try:
        user = User.objects.get(username=username)
        if check_password(password, user.password):
            return user
        else:
            return None
    except User.DoesNotExist:
        return None




@api_view(['POST'])
def login_user(request):
    """
    登录用户接口（支持用户名和邮箱登录）
    """
    try:
        # 解析 JSON 请求体
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的 JSON 格式'}, status=400)

        identifier = data.get('identifier')  # 用户名或邮箱
        password = data.get('password')

        if not identifier or not password:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '缺少必填字段'}, status=400)

        # 判断登录方式
        if "@" in identifier:  # 简单判断是否为邮箱
            strategy = EmailLoginStrategy()
        else:
            strategy = UsernameLoginStrategy()

        # 使用策略模式进行登录
        login_context = LoginContext(strategy)
        user = login_context.login(identifier, password)

        if user is None:
            return JsonResponse({'code': ERROR, 'message': '无效的凭据'}, status=400)

        # 生成 Token
        refresh = RefreshToken.for_user(user)
        refresh.set_exp(lifetime=timedelta(days=30))  # 设置 refresh_token 的过期时间为一个月
        access_token = str(refresh.access_token)

        # 存储登录状态到 Redis
        cache.set(f"user_{user.id}", access_token, timeout=2592000)  # 设置过期时间为 30 天

        return JsonResponse({
            'code': SUCCESS,
            'data': {
                'refresh': str(refresh),
                'access': access_token,
                'username': user.username,
                'email': user.email,
                'signature': user.signature,
                'avatar': settings.URL_BASE + user.avatar.url if user.avatar else None,
            },
            'message': '登录成功'
        }, status=200)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f'用户登录失败: {str(e)}'}, status=500)

@api_view(['POST'])
@custom_login_required
def logout_user(request):
    """
    登出用户接口
    """
    try:
        # 获取用户 ID
        user_id = request.user_id

        # 从 Redis 中删除登录状态
        cache_key = f"user_{user_id}"
        cache.delete(cache_key)

        return response_json(SUCCESS, message="用户登出成功")
    except Exception as e:
        return response_json(ERROR, message=f"用户登出失败: {str(e)}")


@api_view(['POST'])
@custom_login_required
def change_password(request):
    """
    修改密码接口
    """
    try:
        # 解析 JSON 请求体
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的 JSON 格式'}, status=400)

        # 获取请求参数
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        # 参数校验
        if not old_password or not new_password:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '缺少必填字段'}, status=400)

        # 获取用户 ID
        user_id = request.user_id
        user = User.objects.get(id=user_id)

        # 验证旧密码
        if not check_password(old_password, user.password):
            return JsonResponse({'code': ERROR, 'message': '无效的旧密码'}, status=400)

        # 更新密码
        user.password = make_password(new_password)
        user.save()

        # 重新生成 Token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # 更新 Redis 中的登录状态
        cache_key = f"user_{user.id}"
        cache.set(cache_key, access_token, timeout=360000000)  # 设置过期时间为 100 小时

        return JsonResponse({
            'code': SUCCESS,
            'data': {
                'refresh': str(refresh),
                'access': access_token,
                'username': user.username,
                'signature': user.signature
            },
            'message': '密码修改成功'
        }, status=200)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f"密码修改失败: {str(e)}"}, status=500)


@api_view(['GET'])
@custom_login_required
def get_all_users(request):
    """
    获取所有用户接口
    """
    try:
        # 查询所有用户
        users = User.objects.all()

        # 序列化用户数据
        users_data = [{'id': user.id, 'username': user.username, 'signature': user.signature} for user in users]

        return JsonResponse({'code': SUCCESS, 'data': users_data, 'message': '用户列表获取成功'},
                            status=200)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f'用户列表获取失败: {str(e)}'}, status=500)


@api_view(['POST'])
@custom_login_required
def upload_avatar(request):
    """
    上传用户头像接口
    """
    try:
        # 获取用户 ID
        user_id = request.user_id
        user = User.objects.get(id=user_id)

        # 检查请求中是否包含文件
        if 'avatar' not in request.FILES:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '未提供头像文件'}, status=400)

        avatar_file = request.FILES['avatar']

        # 生成一个唯一的文件名：可以使用UUID和当前时间戳
        file_extension = avatar_file.name.split('.')[-1]  # 获取文件扩展名
        random_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{file_extension}"

        # 保存头像文件
        user.avatar.save(random_filename, ContentFile(avatar_file.read()), save=True)

        # 返回头像的 URL
        avatar_url = user.avatar.url

        print("头像URL:", avatar_url)

        return JsonResponse({'code': SUCCESS, 'message': '头像上传成功', 'avatar_url': settings.URL_BASE + avatar_url}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'code': ERROR, 'message': '用户不存在'}, status=404)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f'头像上传失败: {str(e)}'}, status=500)



@api_view(['POST'])
def reset_password(request):
    """
    用户忘记密码并重置密码接口
    """
    try:
        # 解析 JSON 请求体
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的 JSON 格式'}, status=400)

        # 获取请求参数
        email = data.get('email')
        verification_code = data.get('verification_code')  # 假设验证码已经包含在请求体中
        new_password = data.get('new_password')

        # 参数校验
        if not email or not verification_code or not new_password:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '缺少必填字段'}, status=400)

        # 校验邮箱格式
        if '@' not in email:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的邮箱地址'}, status=400)

        # 校验验证码（从 Redis 获取并验证）
        stored_code = cache.get(email)
        if not stored_code:
            return JsonResponse({'code': ERROR, 'message': '验证码已过期或未发送'}, status=400)

        if verification_code != stored_code:
            return JsonResponse({'code': ERROR, 'message': '验证码不正确'}, status=400)

        # 查找用户
        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse({'code': ERROR, 'message': '邮箱未注册'}, status=400)

        # 更新密码
        user.password = make_password(new_password)
        user.save()

        # 删除验证码，避免重复使用
        cache.delete(email)

        return JsonResponse({'code': SUCCESS, 'message': '密码重置成功'}, status=200)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f'密码重置失败: {str(e)}'}, status=500)


@api_view(['POST'])
@custom_login_required
def change_email(request):
    """
    修改邮箱接口
    """
    try:
        # 解析 JSON 请求体
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的 JSON 格式'}, status=400)

        # 获取请求参数
        new_email = data.get('new_email')
        verification_code = data.get('verification_code')  # 假设验证码已经包含在请求体中

        # 参数校验
        if not new_email or not verification_code:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '缺少必填字段'}, status=400)

        # 校验邮箱格式
        if '@' not in new_email:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的邮箱地址'}, status=400)

        # 校验验证码（从 Redis 获取并验证）
        stored_code = cache.get(new_email)
        if not stored_code:
            return JsonResponse({'code': ERROR, 'message': '验证码已过期或未发送'}, status=400)

        if verification_code != stored_code:
            return JsonResponse({'code': ERROR, 'message': '验证码不正确'}, status=400)

        # 获取当前用户并修改邮箱
        user_id = request.user_id
        user = User.objects.get(id=user_id)

        # 检查新邮箱是否已被注册
        if User.objects.filter(email=new_email).exists():
            return JsonResponse({'code': ERROR, 'message': '邮箱已被注册'}, status=400)

        user.email = new_email
        user.save()

        # 删除验证码，避免重复使用
        cache.delete(new_email)

        return JsonResponse({'code': SUCCESS, 'message': '邮箱修改成功'}, status=200)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f'邮箱修改失败: {str(e)}'}, status=500)


@api_view(['POST'])
@custom_login_required
def change_password(request):
    """
    修改密码接口
    """
    try:
        # 解析 JSON 请求体
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的 JSON 格式'}, status=400)

        # 获取请求参数
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        # 参数校验
        if not old_password or not new_password:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '缺少必填字段'}, status=400)

        # 获取用户 ID
        user_id = request.user_id
        user = User.objects.get(id=user_id)

        # 验证旧密码
        if not check_password(old_password, user.password):
            return JsonResponse({'code': ERROR, 'message': '无效的旧密码'}, status=400)

        # 更新密码
        user.password = make_password(new_password)
        user.save()

        # 重新生成 Token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # 更新 Redis 中的登录状态
        cache_key = f"user_{user.id}"
        cache.set(cache_key, access_token, timeout=360000000)  # 设置过期时间为 100 小时

        return JsonResponse({
            'code': SUCCESS,
            'data': {
                'refresh': str(refresh),
                'access': access_token,
                'username': user.username,
                'signature': user.signature
            },
            'message': '密码修改成功'
        }, status=200)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f"密码修改失败: {str(e)}"}, status=500)


@api_view(['POST'])
@custom_login_required
def edit_user(request):
    """
    编辑用户信息接口
    """
    try:
        # 解析 JSON 请求体
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'code': INVALID_PARAMS, 'message': '无效的 JSON 格式'}, status=400)

        # 获取请求参数
        signature = data.get('signature')  # 用户签名
        avatar = data.get('avatar')  # 用户头像，假设是图片文件

        # 获取当前用户
        user_id = request.user_id
        user = User.objects.get(id=user_id)

        # 更新用户信息
        if signature:
            user.signature = signature

        if avatar:
            # 假设处理头像上传的部分已经实现
            user.avatar.save(avatar.name, avatar)

        user.save()

        return JsonResponse({'code': SUCCESS, 'message': '用户信息更新成功'}, status=200)
    except Exception as e:
        return JsonResponse({'code': ERROR, 'message': f'用户信息更新失败: {str(e)}'}, status=500)
