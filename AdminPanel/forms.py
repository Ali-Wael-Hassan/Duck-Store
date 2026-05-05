from django import forms
from .models import GamificationConfig

class GamificationConfigForm(forms.ModelForm):
    class Meta:
        model = GamificationConfig
        fields = [
            'login_points', 'review_base', 'review_bonus', 
            'review_min_char', 'purchase_rate', 'purchase_max', 'signup_bonus'
        ]
        widgets = {
            field: forms.NumberInput(attrs={'class': 'form-control', 'step': 'any'}) 
            for field in ['login_points', 'review_base', 'review_bonus', 'review_min_char', 'purchase_rate', 'purchase_max', 'signup_bonus']
        }