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
                'message': 'Authorization头格式错误'
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
                'message': str(e)
            }, status=UNAUTHORIZED)
            
        except Exception as e:
            return JsonResponse({
                'code': FORBIDDEN,
                'message': '非法访问请求'
            }, status=FORBIDDEN)
            
        return func(request, *args, **kwargs)
    return wrapper