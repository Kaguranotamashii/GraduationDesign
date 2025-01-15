from django.http import JsonResponse
from .status_code import STATUS_MESSAGES

def response_json(code, data=None, message=None):
    """
    构造统一的 JSON 响应
    :param code: 状态码
    :param data: 返回的数据
    :param message: 自定义消息，如果不传则使用默认消息
    :return: JsonResponse
    """
    # if message is None:
    #     message = STATUS_MESSAGES.get(code, "Unknown error")
    return JsonResponse({
        "code": code,
        "message": message,
        "data": data
    })
