from django import forms


from .models import GamificationConfig
from Storefront.models import Book, Genre
from Authentication.models import User


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

    isbn = forms.CharField(max_length=20, required=True, label="ISBN")
    sku = forms.CharField(max_length=20, required=True, label="SKU")
    stock = forms.IntegerField(label="Current Stock", initial=0, min_value=0)
    genre_name = forms.CharField(
        max_length=100, required=True, label="Genre",
        widget=forms.TextInput(attrs={'list': 'genre-list', 'placeholder': 'Type or pick a genre'}),
    )
    
    class Meta:
        model = Book
        fields = ['title', 'author', 'price', 'pages',
                  'published_date', 'rating', 'description', 'cover_img', 'stock']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'published_date': forms.DateInput(attrs={'type': 'date'}),
            'price': forms.NumberInput(attrs={'step': '0.01', 'min': 0}),
            'rating': forms.NumberInput(attrs={'step': '0.1', 'min': 0, 'max': 5}),
            'stock': forms.NumberInput(attrs={'step': 1, 'min': 0}),
            'pages': forms.NumberInput(attrs={'step': 1, 'min': 1}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.genre_id:
            self.fields['genre_name'].initial = self.instance.genre.name

    def clean_genre_name(self):
        name = self.cleaned_data['genre_name'].strip()
        if not name:
            raise forms.ValidationError("Genre is required.")
        genre, _ = Genre.objects.get_or_create(
            name=name,
            defaults={'slug': name.lower().replace(' ', '-')},
        )
        self.instance.genre = genre
        return name

class AddUserForm(forms.ModelForm):
    # We add a custom choice field for the Role since 'is_staff' is a boolean
    role = forms.ChoiceField(choices=[('user', 'User'), ('admin', 'Admin')], required=True)
    password = forms.CharField(widget=forms.PasswordInput())

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        # Set is_staff based on the role dropdown
        user.is_staff = (self.cleaned_data['role'] == 'admin')
        if commit:
            user.save()
        return user