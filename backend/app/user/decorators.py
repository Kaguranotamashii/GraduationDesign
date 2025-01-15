
from functools import wraps
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed
from probject.status_code import INVALID_PARAMS, ERROR

def custom_login_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            # 获取请求头中的 Authorization 头
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return JsonResponse({'code': INVALID_PARAMS, 'message': 'Authorization header is missing'}, status=401)

            # 提取 Token
            try:
                token_type, token = auth_header.split()
                if token_type.lower() != 'bearer':
                    return JsonResponse({'code': INVALID_PARAMS, 'message': 'Invalid token type'}, status=401)
            except ValueError:
                return JsonResponse({'code': INVALID_PARAMS, 'message': 'Invalid token format'}, status=401)

            # 验证 Token
            try:
                access_token = AccessToken(token)
                user_id = access_token.payload['user_id']

            #     如果token过期了抛出其他的异常 但是也要通过 code success
            except AuthenticationFailed as e:
                # token 可能过期了 抛出异常
                return JsonResponse({'code': ERROR, 'message': str(e)}, status=401)

            # 将用户对象添加到请求中
            request.user_id = user_id

            return view_func(request, *args, **kwargs)
        except Exception as e:
            return JsonResponse({'code': ERROR, 'message': f"Failed to authenticate user: {str(e)}"}, status=401)
    return _wrapped_view