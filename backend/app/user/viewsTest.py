from django.core.mail import send_mail
from django.http import JsonResponse
from django.conf import settings
import random
from django.template.loader import render_to_string

def send_test_email(request):
    # 获取 GET 参数中的收件人邮箱
    recipient_email = request.GET.get('email')

    if not recipient_email:
        return JsonResponse({'error': 'Email parameter is missing'}, status=400)

    # 生成一个随机验证码
    verification_code = random.randint(100000, 999999)

    # 设置邮件主题
    subject = "神乐古建筑平台欢迎您注册！"

    # 设计邮件内容（HTML格式）
    message = render_to_string(
        'emails/registration_email.html',  # 假设你有一个模板文件
        {
            'verification_code': verification_code,  # 将验证码传递到模板
        }
    )

    from_email = settings.EMAIL_HOST_USER  # 默认发件人

    try:
        send_mail(
            subject,  # 邮件主题
            message,  # 邮件内容（HTML）
            from_email,  # 发件人
            [recipient_email],  # 收件人
            fail_silently=False,
            html_message=message  # 发送HTML格式的邮件
        )
        return JsonResponse({'message': 'Test email sent successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
