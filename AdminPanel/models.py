from django.db import models
from django.conf import settings
from Storefront.models import Genre

# GAMIFICATION & REWARDS

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
    genre = models.ForeignKey('storefront.Genre', on_delete=models.CASCADE) 

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

class FeaturedPromo(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    promo_type = models.CharField(max_length=50)
    badge_label = models.CharField(max_length=50)
    btn_text = models.CharField(max_length=100)
    image = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

class CuratedConfig(models.Model):
    display_genre = models.ForeignKey('storefront.Genre', on_delete=models.CASCADE)
    limit = models.IntegerField(default=4)