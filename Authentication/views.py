from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.contrib.auth import login, logout, authenticate
from .forms import SignUpForm, LoginForm
from .models import User
from AdminPanel.models import GamificationConfig
from django.utils.timezone import now

class SignUpView(View):
    template_name = 'Authentication/signup.html'
    
    def get(self, request):
        form = SignUpForm()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = SignUpForm(request.POST)
        
        if form.is_valid():
            user = form.save()
            
            login(request, user)
            
            return redirect('home')
        
        # If form is invalid, re-render the template with validation errors
        return render(request, self.template_name, {'form': form})

class LoginView(View):
    template_name = 'Authentication/login.html'
    
    def get(self, request):
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

                    if user.role == 'admin':
                        return redirect('dashboard')

                    return redirect('home')

            form.add_error(None, "Invalid email or password")

        return render(request, self.template_name, {'form': form})

def debug_logout(request):
    logout(request)
    return JsonResponse({"message": "session cleared"})