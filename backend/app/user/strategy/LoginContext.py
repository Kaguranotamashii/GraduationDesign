from app.user.models import User
from app.user.strategy import LoginStrategy


class LoginContext:
    def __init__(self, strategy: LoginStrategy):
        self.strategy = strategy

    def set_strategy(self, strategy: LoginStrategy):
        self.strategy = strategy

    def login(self, identifier: str, password: str) -> User:
        return self.strategy.login(identifier, password)
