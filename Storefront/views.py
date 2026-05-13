import uuid
from datetime import date
from decimal import Decimal

from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from django.views.generic import ListView
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db.models import Avg

from Community.models import Badge, UserBadge

from Storefront.models import (
    Book, Review, Inventory, Order,
    FeaturedPromo, UserBook,
    CuratedConfig, Genre
)
from AdminPanel.models import GamificationConfig

PAGE_SIZE = 10

# =========================================================
# Shared utilities (no auth logic here)
# =========================================================
class SharedHelper:

    @staticmethod
    def paginate(queryset, page_number, per_page=PAGE_SIZE):
        from django.core.paginator import Paginator
        return Paginator(queryset, per_page).get_page(page_number)

    @staticmethod
    def _checkAndAwardBadges(user):
        eligible = Badge.objects.filter(requirement__lte=user.points)
        already_awarded = UserBadge.objects.filter(user=user).values_list("badge_id", flat=True)

        for badge in eligible:
            if badge.pk not in already_awarded:
                UserBadge.objects.create(user=user, badge=badge)

    @staticmethod
    def _getFeaturedPromos():
        return FeaturedPromo.objects.filter(is_active=True)

# =========================================================
# Book business logic
# =========================================================
class BookActionHelper:

    @staticmethod
    def checkOwnership(user, book_id: int) -> bool:
        if not user.is_authenticated:
            return False
        return UserBook.objects.filter(user=user, book_id=book_id).exists()

    @staticmethod
    def _awardReviewPoints(user, comment: str) -> int:
        config = GamificationConfig.load()

        points = config.review_base
        if len(comment or "") >= config.review_min_char:
            points += config.review_bonus

        user.points += points
        user.reviews = (user.reviews or 0) + 1
        user.save(update_fields=["points", "reviews"])

        SharedHelper._checkAndAwardBadges(user)
        return points

    @staticmethod
    def _awardPurchasePoints(user, price: Decimal) -> int:
        config = GamificationConfig.load()

        earned = min(int(float(price) * config.purchase_rate), config.purchase_max)

        user.points += earned
        user.readings = (user.readings or 0) + 1
        user.save(update_fields=["points", "readings"])

        SharedHelper._checkAndAwardBadges(user)
        return earned

# =========================================================
# BOOK DETAIL
# =========================================================
class BookDetailView(View):

    def get(self, request, book_id: int):
        book = get_object_or_404(
            Book.objects.select_related("genre", "inventory"),
            pk=book_id
        )

        user = request.user

        return render(request, "Storefront/book-view.html", {
            "book": book,
            "reviews": Review.objects.filter(book=book).order_by("-created_at")[:5],
            "owned": BookActionHelper.checkOwnership(user, book_id),
            "user": user if user.is_authenticated else None,
            "featured": SharedHelper._getFeaturedPromos().first(),
            "book_detail": {
                "synopsis": (book.description or "").strip()
                or "No synopsis available for this book.",
                "cover": book.cover_img.url if book.cover_img else None,
                "rating": float(book.rating or 0.0),
            },
        })

# =========================================================
# BUY BOOK (LOGIN REQUIRED)
# =========================================================
class BookBuyView(LoginRequiredMixin, View):
    login_url = "login"

    def post(self, request, book_id: int):
        user = request.user
        book = get_object_or_404(Book, pk=book_id)

        try:
            inventory = book.inventory
        except Inventory.DoesNotExist:
            messages.error(request, "This book is not available for purchase.")
            return redirect("book_detail", book_id=book_id)

        if inventory.stock < 1:
            messages.error(request, "Out of stock.")
            return redirect("book_detail", book_id=book_id)

        if BookActionHelper.checkOwnership(user, book.id):
            messages.error(request, "Already owned.")
            return redirect("book_detail", book_id=book_id)

        cost = int(book.price)
        if user.points < cost:
            messages.error(request, f"Not enough points. You need {cost} pts but only have {user.points}.")
            return redirect("book_detail", book_id=book_id)

        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"

        Order.objects.create(
            id=order_id,
            customer=user,
            customer_name=user.name,
            book=book,
            book_title=book.title,
            total=book.price,
            status="completed",
            date=date.today(),
        )

        UserBook.objects.create(user=user, book=book, ownership_type="bought")

        user.points -= cost
        user.readings = (user.readings or 0) + 1
        user.save(update_fields=["points", "readings"])

        inventory.stock -= 1
        inventory.save(update_fields=["stock"])

        book.sales = (book.sales or 0) + 1
        book.save(update_fields=["sales"])

        SharedHelper._checkAndAwardBadges(user)

        messages.success(request, f"Successfully purchased! Order ID: {order_id}")
        return redirect("book_detail", book_id=book_id)

# =========================================================
# BORROW BOOK (LOGIN REQUIRED)
# =========================================================
class BookBorrowView(LoginRequiredMixin, View):
    login_url = "login"

    def post(self, request, book_id: int):
        user = request.user
        book = get_object_or_404(Book, pk=book_id)

        if BookActionHelper.checkOwnership(user, book.id):
            messages.error(request, "Already in your library.")
            return redirect("book_detail", book_id=book_id)

        UserBook.objects.create(user=user, book=book, ownership_type="rented")

        messages.success(request, "Successfully borrowed to your library!")
        return redirect("book_detail", book_id=book_id)

# =========================================================
# ADD REVIEW (LOGIN REQUIRED)
# =========================================================
class BookReviewView(LoginRequiredMixin, View):
    login_url = "login"

    def post(self, request, book_id: int):
        user = request.user
        book = get_object_or_404(Book, pk=book_id)

        try:
            rating = int(request.POST.get("rating", 0))
        except ValueError:
            rating = 0
            
        comment = request.POST.get("comment", "").strip()

        if not (1 <= rating <= 5):
            messages.error(request, "Rating must be between 1 and 5.")
            return redirect("book_detail", book_id=book_id)

        Review.objects.create(
            book=book,
            user=user,
            user_name=user.name,
            rating=rating,
            comment=comment
        )

        avg = Review.objects.filter(book=book).aggregate(a=Avg("rating"))["a"] or 0.0
        book.rating = round(avg, 2)
        book.save(update_fields=["rating"])

        points = BookActionHelper._awardReviewPoints(user, comment)

        messages.success(request, f"Review added! You earned {points} points.")
        return redirect("book_detail", book_id=book_id)

# =========================================================
# HOME (PUBLIC)
# =========================================================
class HomeView(View):
    template_name = "Storefront/home.html"

    def get(self, request):
        curated_setup = CuratedConfig.objects.first()

        return render(request, self.template_name, {
            "featured_promos": FeaturedPromo.objects.filter(is_active=True),
            "trending_books": Book.objects.order_by("-sales")[:7],
            "curated_books": (
                Book.objects.filter(genre=curated_setup.display_genre)[:curated_setup.limit]
                if curated_setup else []
            ),
            "curated_config": curated_setup,
        })

# =========================================================
# CATALOG (PUBLIC)
# =========================================================
class CatalogView(ListView):
    model = Book
    template_name = "Storefront/store.html"
    context_object_name = "page_obj"
    paginate_by = PAGE_SIZE

    def get_queryset(self):
        queryset = Book.objects.all()

        category = self.request.GET.get("category")
        sort_by = self.request.GET.get("sort", "popularity")

        if category:
            queryset = queryset.filter(genre__name__iexact=category)

        try:
            if self.request.GET.get("minPrice"):
                queryset = queryset.filter(price__gte=float(self.request.GET["minPrice"]))
            if self.request.GET.get("maxPrice"):
                queryset = queryset.filter(price__lte=float(self.request.GET["maxPrice"]))
        except ValueError:
            pass

        sort_map = {
            "price-low": "price",
            "price-high": "-price",
            "title": "title",
            "popularity": "-sales"
        }

        return queryset.order_by(sort_map.get(sort_by, "-sales"))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["genres"] = Genre.objects.all()
        context["current_sort"] = self.request.GET.get("sort", "popularity")
        return context