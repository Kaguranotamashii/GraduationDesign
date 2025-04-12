# app/analytics/middleware.py

import time
import json
from django.conf import settings
from .models import APIAccessLog

class AnalyticsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 记录请求开始时间
        start_time = time.time()

        # 获取请求IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        response = self.get_response(request)

        # 计算响应时间
        response_time = (time.time() - start_time) * 1000  # 转换为毫秒

        # 排除静态文件和媒体文件的访问记录
        path = request.path
        excluded_prefixes = ['/static/', '/media/', '/admin/jsi18n/']
        is_excluded = any(path.startswith(prefix) for prefix in excluded_prefixes)
        
        # 只记录API访问,排除静态资源和特定路径
        if not is_excluded and not path.startswith('/admin/') or path.startswith('/app/'):
            try:
                # 获取请求数据 (安全处理,避免记录敏感信息)
                request_data = None
                if request.method in ['POST', 'PUT', 'PATCH']:
                    # 复制请求数据,排除敏感字段
                    if hasattr(request, 'POST'):
                        request_data = request.POST.dict()
                    elif hasattr(request, 'data'):
                        # 处理DRF请求
                        try:
                            request_data = request.data.copy()
                        except:
                            pass
                    
                    # 移除敏感信息
                    sensitive_fields = ['password', 'token', 'secret', 'key', 'auth']
                    if request_data:
                        for field in sensitive_fields:
                            if field in request_data:
                                request_data[field] = '******'

                # 创建访问日志
                APIAccessLog.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    ip_address=ip,
                    method=request.method,
                    path=path,
                    status_code=response.status_code,
                    response_time=response_time,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    request_data=request_data
                )
            except Exception as e:
                print(f"Error logging API access: {e}")

        return response