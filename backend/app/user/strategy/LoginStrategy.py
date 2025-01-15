from abc import ABC, abstractmethod
from django.contrib.auth.hashers import check_password

from ..models import User

class LoginStrategy(ABC):
    @abstractmethod
    def login(self, identifier: str, password: str) -> User:
        """登录接口，返回 User 对象"""
        pass



