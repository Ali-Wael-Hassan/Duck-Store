# GAMIFICATION & REWARDS
import random
from django.db import models

from django.db import models
from django.conf import settings
from Storefront.models import Genre
from Storefront.models import FeaturedPromo, CuratedConfig


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    genre = models.ForeignKey('Storefront.Genre', on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    pages = models.IntegerField()
    published_date = models.CharField(max_length=100)
    rating = models.FloatField(default=0.0)
    description = models.TextField()
    image = models.ImageField(upload_to='books/', default='assets/dummy/a1.jpg')
    
    # Inventory Logic (from JS)
    isbn = models.CharField(max_length=20, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    stock = models.IntegerField(default=50)
    max_stock = models.IntegerField(default=100)

    def save(self, *args, **kwargs):
        if not self.isbn:
            self.isbn = f"978-{random.randint(1000000000, 9999999999)}"
        if not self.sku:
            self.sku = f"DUCK-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    @property
    def status_ui(self):
        """Replaces getStatusUI(stock) from JS"""
        if self.stock <= 0:
            return {'class': 'status-red', 'text': 'Sold Out'}
        if self.stock < 10:
            return {'class': 'status-yellow', 'text': 'Low Stock'}
        return {'class': 'status-green', 'text': 'In Stock'}
    
class Badge(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    color = models.CharField(max_length=20)
    requirement = models.IntegerField(help_text="Points or readings required")
    level = models.CharField(max_length=20)

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

class Reward(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    cost = models.IntegerField(help_text="Points cost to redeem")
    cover_image = models.CharField(max_length=255)
    reward_type = models.CharField(max_length=20)
    badge = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.title

class RewardRedemption(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    points_spent = models.IntegerField()
    redeemed_at = models.DateTimeField(auto_now_add=True)

# PROMOTIONS & DISCOUNTS

class SaleEvent(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    percentage = models.FloatField(help_text="Discount percentage (e.g., 0.20 for 20%)")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class SaleDiscount(models.Model):
    sale_event = models.ForeignKey(SaleEvent, on_delete=models.CASCADE, related_name='discounts')
    genre = models.ForeignKey('Storefront.Genre', on_delete=models.CASCADE) 

# ANALYTICS & CONFIGURATION

class DashboardStat(models.Model):
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    trend = models.CharField(max_length=20)
    color = models.CharField(max_length=30)
    subtext = models.CharField(max_length=100)
    sort_order = models.IntegerField(default=0)

class SalesPerformance(models.Model):
    period_type = models.CharField(max_length=10)
    label = models.CharField(max_length=20)
    total_height = models.IntegerField()
    fill_height = models.IntegerField()
    sort_order = models.IntegerField(default=0)

class GamificationConfig(models.Model):
    login_points = models.IntegerField(default=10)
    review_base = models.IntegerField(default=25)
    review_bonus = models.IntegerField(default=50)
    review_min_char = models.IntegerField(default=100)
    purchase_rate = models.FloatField(default=2.0)
    purchase_max = models.IntegerField(default=500)
    signup_bonus = models.IntegerField(default=50)

    class Meta:
        verbose_name = "Gamification Configuration"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

class Order(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=150)
    
    # Add related_name='admin_orders' here
    book = models.ForeignKey(
        'Storefront.Book', 
        on_delete=models.CASCADE, 
        related_name='admin_orders'
    )
    
    book_title = models.CharField(max_length=255)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    date = models.DateField()