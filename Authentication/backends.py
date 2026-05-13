from django.contrib.auth.backends import ModelBackend
from .jwt_utils import get_user_from_token


class JWTBackend(ModelBackend):
    def authenticate(self, request, token=None, **kwargs):
        if token is None:
            return None
        return get_user_from_token(token)
