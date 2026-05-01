from django.db import models
from django.utils import timezone


# ============================================================
# PACKAGE 1 — Identity & Auth
# ============================================================

class Rank(models.Model):
    name       = models.CharField(max_length=100)
    min_points = models.IntegerField()
    max_points = models.IntegerField()
    icon       = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        db_table = "Rank"
        verbose_name = "Rank"
        verbose_name_plural = "Ranks"

    def __str__(self):
        return self.name


class User(models.Model):
    ROLE_CHOICES = [
        ("admin",    "Admin"),
        ("customer", "Customer"),
        ("staff",    "Staff"),
    ]

    rank        = models.ForeignKey(Rank, on_delete=models.PROTECT, related_name="users")
    name        = models.CharField(max_length=150)
    uname       = models.CharField(max_length=100)
    email       = models.EmailField(max_length=255, unique=True)
    password    = models.CharField(max_length=255)
    role        = models.CharField(max_length=20, choices=ROLE_CHOICES)
    avatar      = models.ImageField(upload_to="avatars/", blank=True, null=True)
    points      = models.IntegerField(default=0)
    readings    = models.IntegerField(default=0)
    reviews     = models.IntegerField(default=0)
    join_date   = models.DateField(auto_now_add=True)
    last_login  = models.DateField(blank=True, null=True)
    last_active = models.DateField(blank=True, null=True)
    session_id  = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "User"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.name} (@{self.uname})"

    def get_tier(self) -> str:
        """Return the name of the rank tier for this user's current points."""
        try:
            rank = Rank.objects.get(
                min_points__lte=self.points,
                max_points__gte=self.points,
            )
            return rank.name
        except Rank.DoesNotExist:
            return "Unranked"

    def get_global_rank(self) -> int:
        """Return 1-based position of this user sorted by points descending."""
        return User.objects.filter(points__gt=self.points).count() + 1


# ============================================================
# PACKAGE 2 — Catalog
# ============================================================

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        db_table = "Genre"
        verbose_name = "Genre"
        verbose_name_plural = "Genres"

    def __str__(self):
        return self.name


class Book(models.Model):
    genre          = models.ForeignKey(Genre, on_delete=models.PROTECT, related_name="books")
    title          = models.CharField(max_length=255)
    author         = models.CharField(max_length=255)
    price          = models.DecimalField(max_digits=10, decimal_places=2)
    pages          = models.IntegerField()
    rating         = models.FloatField(default=0.0)
    cover_img      = models.ImageField(upload_to="covers/", blank=True, null=True)
    published_date = models.CharField(max_length=50, blank=True, null=True)
    description    = models.TextField(blank=True, null=True)
    sales          = models.IntegerField(default=0)

    class Meta:
        db_table = "Book"
        verbose_name = "Book"
        verbose_name_plural = "Books"

    def __str__(self):
        return f"{self.title} — {self.author}"


class Inventory(models.Model):
    book      = models.OneToOneField(Book, on_delete=models.CASCADE, related_name="inventory")
    isbn      = models.CharField(max_length=20, unique=True)
    sku       = models.CharField(max_length=20, unique=True)
    stock     = models.IntegerField(default=0)
    max_stock = models.IntegerField(default=100)

    class Meta:
        db_table = "Inventory"
        verbose_name = "Inventory"
        verbose_name_plural = "Inventories"

    def __str__(self):
        return f"Inventory({self.book.title})"

    def get_status(self) -> str:
        if self.stock == 0:
            return "Out of Stock"
        if self.stock < self.max_stock * 0.2:
            return "Low Stock"
        return "In Stock"

    def stock_percent(self) -> float:
        if self.max_stock == 0:
            return 0.0
        return round((self.stock / self.max_stock) * 100, 2)


class Review(models.Model):
    book       = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="book_reviews")
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_reviews")
    user_name  = models.CharField(max_length=150)
    rating     = models.IntegerField()
    comment    = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Review"
        verbose_name = "Review"
        verbose_name_plural = "Reviews"

    def __str__(self):
        return f"Review by {self.user_name} on '{self.book.title}'"


# ============================================================
# PACKAGE 3 — Library (Ownership)
# ============================================================

class UserBook(models.Model):
    OWNERSHIP_CHOICES = [
        ("bought",  "Bought"),
        ("rented",  "Rented"),
        ("gifted",  "Gifted"),
    ]

    user           = models.ForeignKey(User, on_delete=models.CASCADE, related_name="library")
    book           = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="owners")
    ownership_type = models.CharField(max_length=10, choices=OWNERSHIP_CHOICES)
    acquired_at    = models.DateField(auto_now_add=True)
    progress       = models.IntegerField(default=0)

    class Meta:
        db_table = "UserBook"
        verbose_name = "User Book"
        verbose_name_plural = "User Books"

    def __str__(self):
        return f"{self.user.uname} → {self.book.title} ({self.ownership_type})"


# ============================================================
# PACKAGE 4 — Orders & Sales
# ============================================================

class SaleEvent(models.Model):
    name       = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date   = models.DateField()
    percentage = models.FloatField()
    is_active  = models.BooleanField(default=True)

    class Meta:
        db_table = "SaleEvent"
        verbose_name = "Sale Event"
        verbose_name_plural = "Sale Events"

    def __str__(self):
        return f"{self.name} ({self.percentage}% off)"


class SaleDiscount(models.Model):
    sale_event = models.ForeignKey(SaleEvent, on_delete=models.CASCADE, related_name="discounts")
    genre      = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name="sale_discounts")

    class Meta:
        db_table = "SaleDiscount"
        verbose_name = "Sale Discount"
        verbose_name_plural = "Sale Discounts"
        unique_together = ("sale_event", "genre")

    def __str__(self):
        return f"{self.sale_event.name} → {self.genre.name}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending",    "Pending"),
        ("completed",  "Completed"),
        ("cancelled",  "Cancelled"),
        ("refunded",   "Refunded"),
    ]

    # Custom CharField PK to match the SQL schema (e.g. "ORD-00001")
    id            = models.CharField(max_length=20, primary_key=True)
    customer      = models.ForeignKey(User, on_delete=models.PROTECT, related_name="orders")
    customer_name = models.CharField(max_length=150)
    book          = models.ForeignKey(Book, on_delete=models.PROTECT, related_name="orders")
    book_title    = models.CharField(max_length=255)
    total         = models.DecimalField(max_digits=10, decimal_places=2)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES)
    date          = models.DateField()

    class Meta:
        db_table = "Order"
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order {self.id} — {self.customer_name}"

    def is_refund(self) -> bool:
        return self.status == "refunded"


# ============================================================
# PACKAGE 5 — Gamification
# ============================================================

class GamificationConfig(models.Model):
    """Singleton — only one row should exist."""
    login_points    = models.IntegerField(default=10)
    review_base     = models.IntegerField(default=25)
    review_bonus    = models.IntegerField(default=50)
    review_min_char = models.IntegerField(default=100)
    purchase_rate   = models.FloatField(default=2.0)
    purchase_max    = models.IntegerField(default=500)
    signup_bonus    = models.IntegerField(default=50)

    class Meta:
        db_table = "GamificationConfig"
        verbose_name = "Gamification Config"
        verbose_name_plural = "Gamification Config"

    def save(self, *args, **kwargs):
        self.pk = 1  # Enforce singleton
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # Prevent deletion

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Gamification Configuration"


class Badge(models.Model):
    name        = models.CharField(max_length=100)
    icon        = models.CharField(max_length=10, blank=True, null=True)
    color       = models.CharField(max_length=20, blank=True, null=True)
    requirement = models.IntegerField()
    level       = models.CharField(max_length=20)

    class Meta:
        db_table = "Badge"
        verbose_name = "Badge"
        verbose_name_plural = "Badges"

    def __str__(self):
        return f"{self.name} (Level: {self.level})"


class UserBadge(models.Model):
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name="badges")
    badge       = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name="awarded_to")
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "UserBadge"
        verbose_name = "User Badge"
        verbose_name_plural = "User Badges"
        unique_together = ("user", "badge")

    def __str__(self):
        return f"{self.user.uname} unlocked '{self.badge.name}'"


class Reward(models.Model):
    REWARD_TYPE_CHOICES = [
        ("discount",  "Discount"),
        ("freebie",   "Freebie"),
        ("exclusive", "Exclusive"),
    ]

    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    cost        = models.IntegerField()
    cover_image = models.ImageField(upload_to="rewards/", blank=True, null=True)
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPE_CHOICES, blank=True, null=True)
    badge       = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = "Reward"
        verbose_name = "Reward"
        verbose_name_plural = "Rewards"

    def __str__(self):
        return f"{self.title} ({self.cost} pts)"


class RewardRedemption(models.Model):
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name="redemptions")
    reward       = models.ForeignKey(Reward, on_delete=models.CASCADE, related_name="redemptions")
    points_spent = models.IntegerField()
    redeemed_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "RewardRedemption"
        verbose_name = "Reward Redemption"
        verbose_name_plural = "Reward Redemptions"

    def __str__(self):
        return f"{self.user.uname} redeemed '{self.reward.title}'"


# ============================================================
# PACKAGE 6 — Promotions & Content
# ============================================================

class FeaturedPromo(models.Model):
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    promo_type  = models.CharField(max_length=50, blank=True, null=True)
    badge_label = models.CharField(max_length=50, blank=True, null=True)
    btn_text    = models.CharField(max_length=100, blank=True, null=True)
    image       = models.ImageField(upload_to="promos/", blank=True, null=True)
    is_active   = models.BooleanField(default=True)

    class Meta:
        db_table = "FeaturedPromo"
        verbose_name = "Featured Promo"
        verbose_name_plural = "Featured Promos"

    def __str__(self):
        return self.title


class CuratedConfig(models.Model):
    """Singleton — one active curated section config."""
    display_genre = models.ForeignKey(Genre, on_delete=models.PROTECT, related_name="curated_configs")
    limit         = models.IntegerField(default=4)

    class Meta:
        db_table = "CuratedConfig"
        verbose_name = "Curated Config"
        verbose_name_plural = "Curated Configs"

    def save(self, *args, **kwargs):
        self.pk = 1  # Enforce singleton
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # Prevent deletion

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"Curated: {self.display_genre.name} (limit={self.limit})"


# ============================================================
# PACKAGE 7 — Analytics
# ============================================================

class DashboardStat(models.Model):
    label      = models.CharField(max_length=100)
    value      = models.CharField(max_length=50)
    trend      = models.CharField(max_length=20, blank=True, null=True)
    color      = models.CharField(max_length=30, blank=True, null=True)
    subtext    = models.CharField(max_length=100, blank=True, null=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = "DashboardStat"
        verbose_name = "Dashboard Stat"
        verbose_name_plural = "Dashboard Stats"
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.label}: {self.value}"


class SalesPerformance(models.Model):
    PERIOD_CHOICES = [
        ("daily",   "Daily"),
        ("weekly",  "Weekly"),
        ("monthly", "Monthly"),
        ("yearly",  "Yearly"),
    ]

    period_type  = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    label        = models.CharField(max_length=20)
    total_height = models.IntegerField()
    fill_height  = models.IntegerField()
    sort_order   = models.IntegerField(default=0)

    class Meta:
        db_table = "SalesPerformance"
        verbose_name = "Sales Performance"
        verbose_name_plural = "Sales Performances"
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.period_type.capitalize()} — {self.label}"