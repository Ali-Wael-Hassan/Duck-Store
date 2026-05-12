from django.db import models
from django.conf import settings

# CORE STOREFRONT MODELS (Book View & Store)
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Book(models.Model):
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, related_name='books')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    pages = models.IntegerField()
    rating = models.FloatField(default=0.0)
    cover_img = models.CharField(max_length=255)
    published_date = models.TextField()
    description = models.TextField()
    sales = models.IntegerField(default = 0)
    
    def __str__(self):
        return self.title
    
class Inventory(models.Model):
    book = models.OneToOneField(Book, on_delete=models.CASCADE, related_name='inventory')
    isbn = models.CharField(max_length=20, unique=True)
    sku = models.CharField(max_length=20, unique=True)
    stock = models.IntegerField(default=0)
    max_stock = models.IntegerField(default=100)
    
    def __str__(self):
        return f"Inventory: {self.book.title}"
    
# USER INTERACTION MODELS (Library & Feedback)

class UserBook(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='owned_by')
    ownership_type = models.CharField(max_length=10)
    acquired_at = models.DateField(auto_now_add=True)
    progress = models.IntegerField(default=0)
    
    class Meta:
        # unique constraints
        unique_together = ('user', 'book')
    
    def __str__(self):
        return f"{self.user.username} - {self.book.title}"

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_reviews')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='book_reviews')
    user_name = models.CharField(max_length=150)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.rating} Stars by {self.user_name}"
    
# Transactions

class Order(models.Model):
    id = models.CharField(max_length=20, primary_key=True) 
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='orders')
    customer_name = models.CharField(max_length=150)
    book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True)
    book_title = models.CharField(max_length=255)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.status}"
    
# Configuration
class CuratedConfig(models.Model):
    display_genre = models.ForeignKey(Genre, on_delete=models.CASCADE)
    limit = models.IntegerField(default=4)

    def __str__(self):
        return f"Curated: {self.display_genre.name}"

class FeaturedPromo(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    promo_type = models.CharField(max_length=50)
    badge_label = models.CharField(max_length=50)
    btn_text = models.CharField(max_length=100)
    image = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title