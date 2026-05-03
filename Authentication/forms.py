from django import forms
from .models import User

class SignUpForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    
    # inner class for meta data
    class Meta:
        model = User
        fields = ['name', 'email', 'password']
    
    def save(self, commit=True):
        # get instance from form
        user = super().save(commit=False)
        
        # hash the password
        user.set_password(self.cleaned_data["password"])
        
        # sets the custom fields
        user.role = 'user'
        
        # generates username from the email
        base_username = user.email.split('@')[0]
        
        username = base_username 
        counter = 1
        
        while User.objects.filter(username=username).exists(): 
            username = f"{base_username}{counter}"
            counter += 1
            
        user.username = username 
        
        if commit:
            user.save()
        return user
    
class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'placeholder': 'name@example.com'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': '••••••••'})
    )