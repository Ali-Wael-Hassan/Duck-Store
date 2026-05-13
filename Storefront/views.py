import uuid
from datetime import date, timedelta

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
        return UserBook.objects.filter(
            user=user, book_id=book_id, ownership_type="bought"
        ).exists()

    @staticmethod
    def checkBorrowed(user, book_id: int) -> bool:
        if not user.is_authenticated:
            return False
        return UserBook.objects.filter(
            user=user, book_id=book_id, ownership_type="rented"
        ).exists()

    @staticmethod
    def activeBorrowCount(user):
        return UserBook.objects.filter(
            user=user, ownership_type="rented"
        ).count()

    @staticmethod
    def _awardReviewPoints(user, comment: str) -> int:
        config = GamificationConfig.load()

        if len(comment or "") < config.review_min_char:
            user.reviews = (user.reviews or 0) + 1
            user.save(update_fields=["reviews"])
            return 0

        points = config.review_base + config.review_bonus
        user.points += points
        user.reviews = (user.reviews or 0) + 1
        user.save(update_fields=["points", "reviews"])

        SharedHelper._checkAndAwardBadges(user)
        return points

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
            "borrowed": BookActionHelper.checkBorrowed(user, book_id),
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
        user.save(update_fields=["points"])

        inventory.stock -= 1
        inventory.save(update_fields=["stock"])

        book.sales = (book.sales or 0) + 1
        book.save(update_fields=["sales"])

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

        if BookActionHelper.checkOwnership(user, book.id) or BookActionHelper.checkBorrowed(user, book.id):
            messages.error(request, "Already in your library.")
            return redirect("book_detail", book_id=book_id)

        config = GamificationConfig.load()

        if BookActionHelper.activeBorrowCount(user) >= config.borrow_limit:
            messages.error(request, f"Borrow limit reached ({config.borrow_limit} max). Return a book first.")
            return redirect("book_detail", book_id=book_id)

        due_date = date.today() + timedelta(days=config.borrow_duration_days)

        UserBook.objects.create(
            user=user, book=book, ownership_type="rented", due_date=due_date
        )

        earned = min(int(float(book.price) * config.borrow_rate), config.borrow_max_points)
        user.points += earned
        user.readings = (user.readings or 0) + 1
        user.save(update_fields=["points", "readings"])

        SharedHelper._checkAndAwardBadges(user)

        messages.success(request, f"Borrowed! You earned {earned} points. Due: {due_date}")
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

        if points:
            messages.success(request, f"Review added! You earned {points} points.")
        else:
            messages.success(request, "Review added (below minimum length, no points earned).")
        return redirect("book_detail", book_id=book_id)

# =========================================================
# HOME (PUBLIC)
# =========================================================
class HomeView(View):
    template_name = "Storefront/home.html"

    def get(self, request):
        curated_configs = CuratedConfig.objects.select_related('book').all()
        featured_books = Book.objects.filter(curated_configs__in=curated_configs) if curated_configs else []

        return render(request, self.template_name, {
            "featured_promos": FeaturedPromo.objects.filter(is_active=True),
            "trending_books": Book.objects.order_by("-sales")[:7],
            "curated_books": featured_books,
            "curated_configs": curated_configs,
        })

# =========================================================
# CATALOG (PUBLIC)
# =========================================================
class CatalogView(ListView):
    model = Book
    template_name = "Storefront/store.html"
    context_object_name = "books"
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