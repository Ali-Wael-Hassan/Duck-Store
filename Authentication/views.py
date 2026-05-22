from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.conf import settings
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from .forms import SignUpForm, LoginForm
from .models import User
from .jwt_utils import encode_token
from AdminPanel.models import GamificationConfig
from django.utils.timezone import now


class SignUpView(View):
    template_name = 'Authentication/signup.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        form = SignUpForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            config = GamificationConfig.load()
            user.points += config.signup_bonus
            user.last_active = now().date()
            user.save(update_fields=["points", "last_active"])
            user.backend = settings.AUTHENTICATION_BACKENDS[0]
            login(request, user)
            token = encode_token(user)
            resp = JsonResponse({
                "success": True,
                "token": token,
                "redirect": "/store/",
            })
            resp.set_cookie("jwt_token", token, httponly=True, max_age=86400, samesite="Lax")
            return resp
        errors = {}
        for field, errs in form.errors.items():
            errors[field] = [str(e) for e in errs]
        return JsonResponse({"success": False, "errors": errors}, status=400)


class LoginView(View):
    template_name = 'Authentication/login.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        form = LoginForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')

            user_obj = User.objects.filter(email=email).first()
            if user_obj:
                user = authenticate(request, email=email, password=password)
                if user is not None:
                    login(request, user)
                    token = encode_token(user)

                    config = GamificationConfig.load()
                    current_date = now().date()

                    if user.last_active is None:
                        user.last_active = current_date
                        user.points += config.login_points
                        user.save(update_fields=['points', 'last_active'])
                    elif user.last_active < current_date:
                        user.points += config.login_points
                        user.last_active = current_date
                        user.save(update_fields=['points', 'last_active'])

                    redirect_url = "/admin-panel/" if user.role == 'admin' else "/store/"
                    resp = JsonResponse({
                        "success": True,
                        "token": token,
                        "redirect": redirect_url,
                    })
                    resp.set_cookie("jwt_token", token, httponly=True, max_age=86400, samesite="Lax")
                    return resp

            return JsonResponse({
                "success": False,
                "errors": {"__all__": ["Invalid email or password"]}
            }, status=400)

        errors = {}
        for field, errs in form.errors.items():
            errors[field] = [str(e) for e in errs]
        return JsonResponse({"success": False, "errors": errors}, status=400)


def debug_logout(request):
    logout(request)
    resp = JsonResponse({"message": "session cleared"})
    resp.delete_cookie("jwt_token")
    return resp


@login_required
def logout_view(request):
    logout(request)
    resp = redirect('login')
    resp.delete_cookie("jwt_token")
    return resp
