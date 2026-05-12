from django import forms
from .models import GamificationConfig, Book


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
        return True


class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'genre', 'price', 'pages',
                  'published_date', 'rating', 'description', 'image', 'stock']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
