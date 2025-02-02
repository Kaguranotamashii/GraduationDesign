import re
import json
import random
import string
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view

from backend.app.user.decorators import jwt_required
from probject.status_code import STATUS_MESSAGES, SUCCESS, ERROR, INVALID_PARAMS, UNAUTHORIZED
from rest_framework_simplejwt.tokens import RefreshToken

# 验证码有效期配置
VERIFICATION_CODE_EXPIRE = 600  # 10分钟（单位：秒）

# 密码强度正则验证
PASSWORD_REGEX = re.compile(
    r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$'
)

def response_json(code, data=None, message=None):
    """统一响应格式"""
    return JsonResponse({
        "code": code,
        "message": message,
        "data": data
    })

def generate_verification_code(length=6):
    """生成数字验证码（包含前导零）"""
    return ''.join(random.choices(string.digits, k=length))

def validate_email_format(email):
    """邮箱格式验证"""
    return re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email)

@api_view(['POST'])
def send_verification_email(request):
    """
    发送验证码邮件（POST方式）
    请求参数：{"email": "user@example.com"}
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        # 参数校验
        if not email:
            return response_json(INVALID_PARAMS, message="邮箱不能为空")
        
        # 邮箱格式验证
        if not validate_email_format(email):
            return response_json(INVALID_PARAMS, message="邮箱格式不正确")

        # 生成验证码
        verification_code = generate_verification_code()
        
        # 存储到缓存（添加前缀防止键冲突）
        cache_key = f'verify:{email}'
        cache.set(cache_key, verification_code, VERIFICATION_CODE_EXPIRE)
        
        # TODO: 实际发送邮件逻辑（示例仅打印）
        print(f'[邮件发送] 收件人：{email} | 验证码：{verification_code}')
        
        return response_json(SUCCESS, message="验证码发送成功")
    
    except json.JSONDecodeError:
        return response_json(INVALID_PARAMS, message="请求格式错误")

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
    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '')
        email = data.get('email', '').lower().strip()  # 邮箱统一小写处理
        code = data.get('code', '')

        # === 参数校验 ===
        # 1. 必填字段检查
        if not all([username, password, email, code]):
            return response_json(INVALID_PARAMS, message="缺少必填字段")

        # 2. 用户名规范检查（4-20位字母数字组合）
        if not re.match(r'^[a-zA-Z0-9]{4,20}$', username):
            return response_json(INVALID_PARAMS, message="用户名需为4-20位字母数字组合")

        # 3. 邮箱格式验证
        if not validate_email_format(email):
            return response_json(INVALID_PARAMS, message="邮箱格式不正确")

        # 4. 密码强度验证（最少8位，包含字母、数字、特殊符号）
        # if not PASSWORD_REGEX.match(password):
        #     return response_json(INVALID_PARAMS, 
        #         message="密码需8-20位，包含字母、数字和特殊符号")

        # 5. 验证码校验
        cache_key = f'verify:{email}'
        cached_code = cache.get(cache_key)
        if not cached_code or cached_code != code:
            return response_json(ERROR, message="验证码错误或已过期")

        # === 业务逻辑 ===
        # 1. 检查用户唯一性
        if User.objects.filter(username__iexact=username).exists():
            return response_json(ERROR, message="用户名已被注册")
        
        if User.objects.filter(email__iexact=email).exists():
            return response_json(ERROR, message="邮箱已被注册")

        # 2. 创建用户（使用Django的create_user方法）
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password  # 自动处理密码哈希
            )
        except Exception as e:
            return response_json(ERROR, message=f"用户创建失败：{str(e)}")

        # 3. 清除已使用的验证码
        cache.delete(cache_key)

        # 4. 返回创建结果（敏感字段过滤）
        return response_json(SUCCESS, 
            data={
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "register_time": user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
            },
            message="注册成功"
        )

    except json.JSONDecodeError:
        return response_json(INVALID_PARAMS, message="请求格式错误")
    except Exception as e:
        return response_json(ERROR, message=f"系统错误：{str(e)}")
    






# 辅助验证函数 --------------------------------------------------
def validate_email(email):
    """邮箱格式验证"""
    return re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email)

# 登录接口 ------------------------------------------------------
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
        # 解析请求体
        try:
            data = json.loads(request.body)
            identifier = data.get('identifier', '').strip()
            password = data.get('password', '')
        except json.JSONDecodeError:
            return response_json(INVALID_PARAMS, message=STATUS_MESSAGES[INVALID_PARAMS])

        # 参数校验
        if not identifier or not password:
            return response_json(INVALID_PARAMS, message="用户名/邮箱和密码不能为空")

        # 验证登录方式
        if '@' in identifier:
            if not validate_email(identifier):
                return response_json(INVALID_PARAMS, message="邮箱格式不正确")
            try:
                user = User.objects.get(email=identifier)
            except User.DoesNotExist:
                return response_json(UNAUTHORIZED, message="邮箱未注册")
        else:
            if len(identifier) < 4:
                return response_json(INVALID_PARAMS, message="用户名至少4位")
            try:
                user = User.objects.get(username=identifier)
            except User.DoesNotExist:
                return response_json(UNAUTHORIZED, message="用户名不存在")

        # 验证密码
        if not user.check_password(password):
            return response_json(UNAUTHORIZED, message="密码错误")

        # 生成JWT令牌
        refresh = RefreshToken.for_user(user) # type: ignore
        access_token = str(refresh.access_token)
        
        # 存储登录状态（示例：记录设备登录）
        device_id = request.META.get('HTTP_X_DEVICE_ID', 'default')
        cache_key = f"user:{user.id}:{device_id}"
        cache.set(cache_key, access_token, timeout=3600*24*30)  # 30天

        # 构造响应数据
        user_data = {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "access_token": access_token,
            "refresh_token": str(refresh),
            "expires_in": 3600*24*30  # 秒
        }

        return response_json(SUCCESS, data=user_data)

    except Exception as e:
        # 生产环境应记录日志
        print(f"登录异常: {str(e)}")  
        return response_json(ERROR, message="系统服务异常")
    
@api_view(['POST'])
@jwt_required
def logout_user(request):
    """登出接口（需要携带有效JWT）"""
    try:
        # 获取设备ID（支持多设备）
        device_id = request.META.get('HTTP_X_DEVICE_ID', 'default')
        
        # 将令牌加入黑名单（剩余有效期+缓冲）
        token = request.auth_token
        payload = RefreshToken(token).payload # type: ignore
        exp_time = payload['exp'] - payload['iat'] + 60  # 增加60秒缓冲
        
        cache.set(f'blacklist:{token}', '1', timeout=exp_time)
        
        # 删除设备登录状态（可选）
        cache.delete(f'user:{request.auth_user.id}:{device_id}')
        
        return JsonResponse({
            'code': SUCCESS,
            'message': STATUS_MESSAGES[SUCCESS]
        }, status=SUCCESS)
        
    except Exception as e:
        return JsonResponse({
            'code': ERROR,
            'message': '登出操作失败'
        }, status=ERROR)