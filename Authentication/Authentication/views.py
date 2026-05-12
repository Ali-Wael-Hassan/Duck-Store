from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import login, authenticate
from .forms import SignUpForm, LoginForm
from .models import User

class SignUpView(View):
    template_name = 'signup.html'
    
    def get(self, request):
        form = SignUpForm()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = SignUpForm(request.POST)
        
        if form.is_valid():
            user = form.save()
            
            login(request, user)
            
            return redirect('login')
        
        # If form is invalid, re-render the template with validation errors
        return render(request, self.template_name, {'form': form})

class LoginView(View):
    template_name = 'login.html'
    
    def get(self, request):
        form = LoginForm()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = LoginForm(request.POST)
        
        if form.is_valid():
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            
            # Find user with the same email
            user_obj = User.objects.filter(email=email).first()
            
            if user_obj:
                user = authenticate(request, email=email, password=password)
                
                if user is not None:
                    login(request, user)
                    
                    # Redirect
                    if user.role == 'admin':
                        # return redirect('dashboard')
                        return redirect('login')
                    
                    return redirect('login')
            # If authentication fails
            form.add_error(None, "Invalid email or password")
            
        # Re-render page with errors
        return render(request, self.template_name, {'form': form})
            