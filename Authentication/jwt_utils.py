import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model

ALGORITHM = "HS256"
ACCESS_TOKEN_TTL = timedelta(hours=24)


def encode_token(user):
    payload = {
        "user_id": user.id,
        "email": user.email,
        "exp": datetime.utcnow() + ACCESS_TOKEN_TTL,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_from_token(token):
    payload = decode_token(token)
    if payload is None:
        return None
    User = get_user_model()
    try:
        return User.objects.get(id=payload["user_id"])
    except User.DoesNotExist:
        return None
