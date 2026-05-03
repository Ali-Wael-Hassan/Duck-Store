from django.contrib import admin

from .models import (
    User, Book, Genre, Review,
    UserBook, Badge, UserBadge,
    CuratedConfig, DashboardStat,
    FeaturedPromo, GamificationConfig,
    Inventory, Order, Rank,
    Reward, RewardRedemption,
    SaleDiscount, SaleEvent,
    SalesPerformance,
)

admin.site.register(Inventory)
admin.site.register(UserBook)
admin.site.register(Book)
admin.site.register(Genre)

