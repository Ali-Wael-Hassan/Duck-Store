from django.db import models
from django.conf import settings

class Reward(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    cost = models.IntegerField(help_text="Points required to redeem this item")
    cover_image = models.CharField(max_length=255, null=True, blank=True)
    reward_type = models.CharField(max_length=20)
    badge = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.title

class RewardRedemption(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    points_spent = models.IntegerField()
    redeemed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.reward.title} ({self.redeemed_at.date()})"