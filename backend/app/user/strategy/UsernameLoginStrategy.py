from django.contrib.auth.hashers import check_password

from app.user.models import User
from app.user.strategy.LoginStrategy import LoginStrategy


class UsernameLoginStrategy(LoginStrategy):
    def login(self, identifier: str, password: str) -> User:
        """通过用户名登录"""
        try:
            user = User.objects.get(username=identifier)
            if check_password(password, user.password):
                return user
        except User.DoesNotExist:
            return None