from django.db import models
from django.conf import settings

# RANKING & PROGRESS

class Badge(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, help_text="Emoji or Icon class")
    color = models.CharField(max_length=20, help_text="Hex code or CSS color")
    requirement = models.IntegerField(help_text="Points required to unlock")
    level = models.CharField(max_length=20, choices=[
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum')
    ])

    def __str__(self):
        return f"{self.name} ({self.level})"

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='unlocked_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge') # User can't unlock same badge twice

# SOCIAL & LEADERBOARD

class LeaderboardEntry(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    current_rank_position = models.IntegerField(default=0)
    last_calculated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['current_rank_position']