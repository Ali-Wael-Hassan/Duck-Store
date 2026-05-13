from django.shortcuts import redirect
from django.contrib import messages
from django.utils.functional import SimpleLazyObject
from Authentication.jwt_utils import get_user_from_token


class JWTCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            anonymous_user = request.user
            def _get_jwt_user(req, fallback):
                token = req.COOKIES.get("jwt_token")
                if token:
                    user = get_user_from_token(token)
                    if user:
                        return user
                return fallback
            request.user = SimpleLazyObject(
                lambda: _get_jwt_user(request, anonymous_user)
            )
        return self.get_response(request)


class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            path = request.path_info
            if not any(path.startswith(p) for p in ['/signup/', '/admin/', '/static/', '/media/']):
                if path != '/':
                    return redirect('login')
        return self.get_response(request)


class AdminRoleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        if path.startswith('/admin-panel/') or (path.startswith('/admin/') and path != '/admin/login/'):
            if not request.user.is_authenticated:
                return redirect('login')
            if request.user.role != 'admin' and not request.user.is_staff:
                messages.error(request, "Admin access required.")
                return redirect('home')
        return self.get_response(request)
