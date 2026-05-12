from django import forms
from .models import User


class SignUpForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': '••••••••',
            'class': 'form-auth__input'
        })
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': 'Full name',
                'class': 'form-auth__input'
            }),
            'email': forms.EmailInput(attrs={
                'placeholder': 'name@example.com',
                'class': 'form-auth__input'
            }),
        }

    # Ensure email is unique
    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email already exists")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)

        # Hash password
        user.set_password(self.cleaned_data["password"])

        # Default role
        user.role = 'user'

        # Generate username from email
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


# =========================
# LOGIN FORM
# =========================
class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'placeholder': 'name@example.com',
            'class': 'form-auth__input',
            'id': 'email-input'
        })
    )

    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': '••••••••',
            'class': 'form-auth__input',
            'id': 'password-input'
        })
    )