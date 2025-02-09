# middleware.py
import sys
import traceback
import logging
from django.conf import settings
from rest_framework.response import Response

logger = logging.getLogger(__name__)

class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        # 在控制台打印完整的错误信息和堆栈跟踪
        print('\n' + '=' * 80, file=sys.stderr)
        print('Error occurred during processing the request:', file=sys.stderr)
        print(f'URL: {request.path}', file=sys.stderr)
        print(f'Method: {request.method}', file=sys.stderr)
        print(f'Error Type: {type(exception).__name__}', file=sys.stderr)
        print(f'Error Message: {str(exception)}', file=sys.stderr)
        print('\nTraceback:', file=sys.stderr)
        traceback.print_exc()
        print('=' * 80 + '\n', file=sys.stderr)

        # 将错误信息记录到日志
        logger.error(
            f"Path: {request.path}\n"
            f"Method: {request.method}\n"
            f"Error: {str(exception)}\n"
            f"Traceback: {traceback.format_exc()}"
        )

