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
            field: forms.NumberInput(attrs={'step': 'any'}) 
            for field in ['login_points', 'review_base', 'review_bonus', 'review_min_char', 'purchase_rate', 'purchase_max', 'signup_bonus']
        }
    
    def validatePoints():
        # TODO check for negative and non digits to be False and otherwise True
        return True;