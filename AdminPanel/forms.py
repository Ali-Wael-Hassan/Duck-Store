from django import forms
<<<<<<< HEAD
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
=======
from .models import Book

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'genre', 'price', 'pages', 
                  'published_date', 'rating', 'description', 'image', 'stock']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
>>>>>>> be0a2b60eb63af18f99b35217a3412662200d247
