# decorators.py
from functools import wraps
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from probject.status_code import UNAUTHORIZED, FORBIDDEN, STATUS_MESSAGES
from django.core.cache import cache

def jwt_required(func):
    """JWT认证注解"""
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        # 获取Authorization头
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        # 检查Bearer令牌格式
        if not auth_header.startswith('Bearer '):
            return JsonResponse({
                'code': UNAUTHORIZED,
                'message': STATUS_MESSAGES[UNAUTHORIZED]  # 使用统一的错误消息
            }, status=UNAUTHORIZED)

        try:
            token = auth_header.split(' ')[1]

            # 检查黑名单
            if cache.get(f'blacklist:{token}'):
                return JsonResponse({
                    'code': UNAUTHORIZED,
                    'message': '令牌已失效'
                }, status=UNAUTHORIZED)

            # JWT验证
            auth = JWTAuthentication()
            validated_token = auth.get_validated_token(token)
            user = auth.get_user(validated_token)

            # 将用户和令牌附加到请求对象
            request.auth_user = user
            request.auth_token = token

        except (InvalidToken, AuthenticationFailed) as e:
            return JsonResponse({
                'code': UNAUTHORIZED,
                'message': str(e),
                'detail': e.detail if hasattr(e, 'detail') else None  # 添加详细错误信息
            }, status=UNAUTHORIZED)

        except Exception as e:
            return JsonResponse({
                'code': FORBIDDEN,
                'message': '非法访问请求',
                'detail': str(e)  # 添加异常详情，便于调试
            }, status=FORBIDDEN)

        return func(request, *args, **kwargs)
    return wrapper



from functools import wraps
from django.http import JsonResponse
from probject.status_code import FORBIDDEN, STATUS_MESSAGES

def admin_required(func):
    """管理员权限检查装饰器"""
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        # 确保在jwt_required之后使用
        if not hasattr(request, 'auth_user'):
            return JsonResponse({
                'code': FORBIDDEN,
                'message': '无效的认证信息'
            }, status=FORBIDDEN)

        # 检查是否是管理员
        if not request.auth_user.is_staff:
            return JsonResponse({
                'code': FORBIDDEN,
                'message': '需要管理员权限'
            }, status=FORBIDDEN)

        return func(request, *args, **kwargs)
    return wrapper