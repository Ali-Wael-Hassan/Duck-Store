from django import forms
from .models import GamificationConfig
from Storefront.models import Book


class GamificationConfigForm(forms.ModelForm):
    class Meta:
        model = GamificationConfig
        fields = [
            'login_points', 'review_base', 'review_bonus', 
            'review_min_char', 'purchase_rate', 'purchase_max', 'signup_bonus'
        ]
        widgets = {
            field: forms.NumberInput(attrs={'step': 'any'}) 
            for field in fields
        }
    
    def clean(self):
        cleaned_data = super().clean()

        for field in self.fields:
            value = cleaned_data.get(field)

            if value is None or (not isinstance(value, (int, float))) or value < 0:
                self.add_error(field, "This field must be a non-negative number.")

        return cleaned_data

class BookForm(forms.ModelForm):

    stock = forms.IntegerField(label="Current Stock", initial=0, min_value=0)
    
    class Meta:
        model = Book
        fields = ['title', 'author', 'genre', 'price', 'pages',
                  'published_date', 'rating', 'description', 'cover_img', 'stock']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
