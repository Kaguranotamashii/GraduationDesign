# app/analytics/middleware.py

import time
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

        # 不记录静态文件和admin的访问
        if 1:
            try:
                # 获取请求数据
                request_data = None
                if request.method in ['POST', 'PUT', 'PATCH']:
                    request_data = request.POST.dict()

                # 创建访问日志
                APIAccessLog.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    ip_address=ip,
                    method=request.method,
                    path=request.path,
                    status_code=response.status_code,
                    response_time=response_time,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    request_data=request_data
                )
            except Exception as e:
                print(f"Error logging API access: {e}")

        return response