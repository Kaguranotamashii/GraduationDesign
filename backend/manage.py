#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import ssl


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'probject.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # 检查是否有--secure标志来启用HTTPS
    if '--secure' in sys.argv:
        sys.argv.remove('--secure')
        from django.core.servers.basehttp import WSGIServer
        # 保存原始的__init__方法
        original_init = WSGIServer.__init__

        # 定义新的__init__方法来应用SSL
        def __init__(self, *args, **kwargs):
            original_init(self, *args, **kwargs)
            # 使用SSL包装socket
            self.socket = ssl.wrap_socket(
                self.socket,
                certfile='cert.pem',  # 确保路径正确
                keyfile='key.pem',    # 确保路径正确
                server_side=True
            )

        # 替换原始的__init__方法
        WSGIServer.__init__ = __init__

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()