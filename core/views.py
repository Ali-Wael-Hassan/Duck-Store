

"""
views.py — Lumina Bookstore
============================
Business-logic layer covering all seven view groups defined in the
MVT diagram (plantuml_export.puml):

  1. Authentication   — AuthView
  2. Storefront       — HomeView, StoreView, BookView
  3. User Account     — MyBooksView, UserProfileView, RewardView
  4. Community        — CommunityView
  5. Admin Panel      — DashboardView, InventoryView,
                        GamificationView, SalesRefundsView, UsersRolesView

All views are function-based and rely only on Django's built-in toolkit
(no third-party packages required beyond what models.py already imports).
"""

import csv
import uuid
import hashlib
from datetime import date
from decimal import Decimal

from django.core.paginator import Paginator
from django.db.models import Avg, Count, Q, Sum
from django.http import JsonResponse, HttpResponse, FileResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from .models import (
    Badge, Book, CuratedConfig, DashboardStat, FeaturedPromo,
    GamificationConfig, Genre, Inventory, Order, Rank,
    Reward, RewardRedemption, Review, SaleDiscount, SaleEvent,
    SalesPerformance, User, UserBadge, UserBook,
)

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

PAGE_SIZE = 10


def _login_required(request):
    """Return the logged-in User object or None."""
    session_id = request.session.get("session_id")
    if not session_id:
        return None
    return User.objects.filter(session_id=session_id).first()


def _admin_required(request):
    """Return user if admin/staff, else None."""
    user = _login_required(request)
    if user and user.role in ("admin", "staff"):
        return user
    return None


def _hash_password(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def _paginate(queryset, page_number, per_page=PAGE_SIZE):
    paginator = Paginator(queryset, per_page)
    return paginator.get_page(page_number)


# ===========================================================================
# 1. AUTHENTICATION
# ===========================================================================

def _award_login_points(user: User) -> None:
    """Credit daily login points according to GamificationConfig."""
    config = GamificationConfig.load()
    user.points += config.login_points
    user.last_login = date.today()
    user.last_active = date.today()
    user.save(update_fields=["points", "last_login", "last_active"])
    _check_and_award_badges(user)


def _validate_credentials(email: str, password: str):
    """Return User on success, None on failure."""
    hashed = _hash_password(password)
    return User.objects.filter(email=email, password=hashed).first()


def _save_session(request, user: User) -> None:
    sid = str(uuid.uuid4())
    user.session_id = sid
    user.save(update_fields=["session_id"])
    request.session["session_id"] = sid


def _check_and_award_badges(user: User) -> None:
    """Award any badges the user now qualifies for (based on points)."""
    eligible = Badge.objects.filter(requirement__lte=user.points)
    already_awarded = UserBadge.objects.filter(user=user).values_list("badge_id", flat=True)
    for badge in eligible:
        if badge.pk not in already_awarded:
            UserBadge.objects.create(user=user, badge=badge)


# --------------------------------------------------------------------------

@require_http_methods(["GET", "POST"])
def login(request) -> HttpResponse:
    """
    GET  → render sign-in page.
    POST → authenticate; redirect to home on success.
    """
    if request.method == "GET":
        return render(request, "sign-in.html")

    email = request.POST.get("email", "").strip().lower()
    password = request.POST.get("password", "")

    user = _validate_credentials(email, password)
    if not user:
        return render(request, "sign-in.html", {"error": "Invalid email or password."})

    _save_session(request, user)
    _award_login_points(user)
    return redirect("home")


@require_http_methods(["GET", "POST"])
def signup(request) -> HttpResponse:
    """
    GET  → render sign-up page.
    POST → create account; redirect to sign-in on success.
    """
    if request.method == "GET":
        return render(request, "sign-up.html")

    name = request.POST.get("name", "").strip()
    uname = request.POST.get("uname", "").strip()
    email = request.POST.get("email", "").strip().lower()
    password = request.POST.get("password", "")

    if User.objects.filter(email=email).exists():
        return render(request, "sign-up.html", {"error": "Email already registered."})

    default_rank = Rank.objects.order_by("min_points").first()
    config = GamificationConfig.load()

    user = User.objects.create(
        name=name,
        uname=uname,
        email=email,
        password=_hash_password(password),
        role="customer",
        rank=default_rank,
        points=config.signup_bonus,
    )
    _check_and_award_badges(user)
    return redirect("login")


@require_GET
def logout(request) -> HttpResponse:
    user = _login_required(request)
    if user:
        user.session_id = None
        user.save(update_fields=["session_id"])
    request.session.flush()
    return redirect("login")


@require_GET
def check_session(request) -> JsonResponse:
    user = _login_required(request)
    if user:
        return JsonResponse({
            "logged_in": True,
            "role": user.role,
            "name": user.name,
            "avatar": user.avatar.url if user.avatar else None,
        })
    return JsonResponse({"logged_in": False}, status=401)


# ===========================================================================
# 2. STOREFRONT
# ===========================================================================

# ── HomeView ────────────────────────────────────────────────────────────────

def _get_featured_promos():
    return FeaturedPromo.objects.filter(is_active=True)


def _get_trending_books():
    return Book.objects.select_related("genre").order_by("-sales")[:10]


def _get_curated_books():
    try:
        config = CuratedConfig.load()
        return Book.objects.filter(genre=config.display_genre).order_by("-rating")[: config.limit]
    except Exception:
        return Book.objects.none()


@require_GET
def home(request) -> HttpResponse:
    context = {
        "featured_promos": _get_featured_promos(),
        "trending_books": _get_trending_books(),
        "curated_books": _get_curated_books(),
        "user": _login_required(request),
    }
    return render(request, "home.html", context)


# ── StoreView ───────────────────────────────────────────────────────────────

def _apply_genre_filter(qs, genres: list):
    if genres:
        return qs.filter(genre__slug__in=genres)
    return qs


def _apply_price_filter(qs, min_price, max_price):
    if min_price is not None:
        qs = qs.filter(price__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price__lte=max_price)
    return qs


def _apply_sorting(qs, sort_key: str):
    sort_map = {
        "price_asc": "price",
        "price_desc": "-price",
        "rating": "-rating",
        "newest": "-published_date",
        "bestseller": "-sales",
    }
    return qs.order_by(sort_map.get(sort_key, "-sales"))


@require_GET
def catalog(request) -> HttpResponse:
    genres = Genre.objects.all()
    books = _apply_sorting(Book.objects.select_related("genre").all(), "bestseller")
    page = _paginate(books, request.GET.get("page", 1))
    return render(request, "store.html", {"books": page, "genres": genres})


@require_GET
def store_filter(request) -> JsonResponse:
    genres = request.GET.getlist("genres")
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")
    sort_key = request.GET.get("sort", "bestseller")
    page_num = int(request.GET.get("page", 1))

    qs = Book.objects.select_related("genre").all()
    qs = _apply_genre_filter(qs, genres)
    qs = _apply_price_filter(
        qs,
        Decimal(min_price) if min_price else None,
        Decimal(max_price) if max_price else None,
    )
    qs = _apply_sorting(qs, sort_key)
    page = _paginate(qs, page_num)

    data = [
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "price": str(b.price),
            "rating": b.rating,
            "cover_img": b.cover_img.url if b.cover_img else None,
            "genre": b.genre.name,
        }
        for b in page
    ]
    return JsonResponse({"books": data, "has_next": page.has_next(), "has_prev": page.has_previous()})


# ── BookView ────────────────────────────────────────────────────────────────

def _check_ownership(user: User, book_id: int) -> bool:
    return UserBook.objects.filter(user=user, book_id=book_id).exists()


def _award_review_points(user: User, comment: str) -> int:
    config = GamificationConfig.load()
    points = config.review_base
    if len(comment or "") >= config.review_min_char:
        points += config.review_bonus
    user.points += points
    user.reviews = (user.reviews or 0) + 1
    user.save(update_fields=["points", "reviews"])
    _check_and_award_badges(user)
    return points


def _award_purchase_points(user: User, price: Decimal) -> int:
    config = GamificationConfig.load()
    earned = min(int(float(price) * config.purchase_rate), config.purchase_max)
    user.points += earned
    user.readings = (user.readings or 0) + 1
    user.save(update_fields=["points", "readings"])
    _check_and_award_badges(user)
    return earned


class BookDetailTemplate:
    """Prepare normalized context payload for book detail rendering."""

    @staticmethod
    def build_context(book: Book) -> dict:
        return {
            "synopsis": (book.description or "").strip() or "No synopsis available for this book.",
            "cover": book.cover_img.url if book.cover_img else None,
            "rating": float(book.rating or 0.0),
        }


class BookView:
    """Book detail + action endpoints."""

    @staticmethod
    @require_GET
    def detail(request, book_id: int) -> HttpResponse:
        book = get_object_or_404(Book.objects.select_related("genre", "inventory"), pk=book_id)
        reviews = Review.objects.filter(book=book).order_by("-created_at")[:5]
        user = _login_required(request)
        owned = _check_ownership(user, book_id) if user else False
        featured = _get_featured_promos().first()
        return render(
            request,
            "book-view.html",
            {
                "book": book,
                "reviews": reviews,
                "owned": owned,
                "user": user,
                "featured": featured,
                "book_detail": BookDetailTemplate.build_context(book),
            },
        )

    @staticmethod
    @require_POST
    def buy(request, book_id: int) -> JsonResponse:
        user = _login_required(request)
        if not user:
            return JsonResponse({"error": "Login required."}, status=401)

        book = get_object_or_404(Book, pk=book_id)
        inventory = get_object_or_404(Inventory, book=book)

        if inventory.stock < 1:
            return JsonResponse({"error": "Out of stock."}, status=400)

        if _check_ownership(user, book_id):
            return JsonResponse({"error": "Already owned."}, status=400)

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
        inventory.stock -= 1
        inventory.save(update_fields=["stock"])
        book.sales = (book.sales or 0) + 1
        book.save(update_fields=["sales"])

        pts = _award_purchase_points(user, book.price)
        return JsonResponse({"success": True, "order_id": order_id, "points_earned": pts})

    @staticmethod
    @require_POST
    def borrow(request, book_id: int) -> JsonResponse:
        user = _login_required(request)
        if not user:
            return JsonResponse({"error": "Login required."}, status=401)

        book = get_object_or_404(Book, pk=book_id)
        if _check_ownership(user, book_id):
            return JsonResponse({"error": "Already in your library."}, status=400)

        UserBook.objects.create(user=user, book=book, ownership_type="rented")
        return JsonResponse({"success": True})


@require_GET
def book_detail(request, book_id: int) -> HttpResponse:
    return BookView.detail(request, book_id)


@require_POST
def buy(request, book_id: int) -> JsonResponse:
    return BookView.buy(request, book_id)


@require_POST
def borrow(request, book_id: int) -> JsonResponse:
    return BookView.borrow(request, book_id)


@require_POST
def add_review(request, book_id: int) -> JsonResponse:
    user = _login_required(request)
    if not user:
        return JsonResponse({"error": "Login required."}, status=401)

    book = get_object_or_404(Book, pk=book_id)
    rating = int(request.POST.get("rating", 0))
    comment = request.POST.get("comment", "").strip()

    if not (1 <= rating <= 5):
        return JsonResponse({"error": "Rating must be between 1 and 5."}, status=400)

    Review.objects.create(
        book=book, user=user, user_name=user.name, rating=rating, comment=comment
    )

    avg = Review.objects.filter(book=book).aggregate(a=Avg("rating"))["a"] or 0.0
    book.rating = round(avg, 2)
    book.save(update_fields=["rating"])

    pts = _award_review_points(user, comment)
    return JsonResponse({"success": True, "points_earned": pts, "new_rating": book.rating})


# ===========================================================================
# 3. USER ACCOUNT
# ===========================================================================

# ── MyBooksView ─────────────────────────────────────────────────────────────

def _get_owned_books(user: User):
    return UserBook.objects.filter(user=user, ownership_type="bought").select_related("book")


def _get_borrowed_books(user: User):
    return UserBook.objects.filter(user=user, ownership_type="rented").select_related("book")


@require_GET
def my_books(request) -> HttpResponse:
    user = _login_required(request)
    if not user:
        return redirect("login")

    tab = request.GET.get("tab", "all")
    if tab == "owned":
        library = _get_owned_books(user)
    elif tab == "borrowed":
        library = _get_borrowed_books(user)
    else:
        library = UserBook.objects.filter(user=user).select_related("book")

    page = _paginate(library, request.GET.get("page", 1))
    return render(request, "my-Books.html", {"library": page, "tab": tab, "user": user})


@require_GET
def my_books_filter(request, filter_type: str) -> JsonResponse:
    user = _login_required(request)
    if not user:
        return JsonResponse({"error": "Login required."}, status=401)

    mapping = {
        "owned": _get_owned_books,
        "borrowed": _get_borrowed_books,
    }
    qs_fn = mapping.get(filter_type)
    qs = qs_fn(user) if qs_fn else UserBook.objects.filter(user=user).select_related("book")
    page = _paginate(qs, request.GET.get("page", 1))

    data = [
        {
            "id": ub.book.id,
            "title": ub.book.title,
            "author": ub.book.author,
            "cover_img": ub.book.cover_img.url if ub.book.cover_img else None,
            "progress": ub.progress,
            "ownership_type": ub.ownership_type,
        }
        for ub in page
    ]
    return JsonResponse({"books": data, "has_next": page.has_next()})


# ── UserProfileView ──────────────────────────────────────────────────────────

def _get_rank_tier(user: User) -> str:
    return user.get_tier()


def _get_badge_config(user: User) -> list:
    return list(
        UserBadge.objects.filter(user=user)
        .select_related("badge")
        .values("badge__name", "badge__icon", "badge__color", "badge__level", "unlocked_at")
    )


def _get_genre_progress(user: User) -> list:
    """Return count of read books per genre for this user."""
    return (
        UserBook.objects.filter(user=user)
        .values("book__genre__name", "book__genre__slug")
        .annotate(count=Count("id"))
        .order_by("-count")
    )


def _get_achievements(user: User) -> list:
    return list(
        UserBadge.objects.filter(user=user)
        .select_related("badge")
        .order_by("-unlocked_at")
        .values("badge__name", "badge__icon", "badge__level", "unlocked_at")
    )


@require_GET
def user_profile(request) -> HttpResponse:
    user = _login_required(request)
    if not user:
        return redirect("login")

    rank = Rank.objects.filter(
        min_points__lte=user.points, max_points__gte=user.points
    ).first()

    context = {
        "user": user,
        "rank": rank,
        "tier": _get_rank_tier(user),
        "global_rank": user.get_global_rank(),
        "badges": _get_badge_config(user),
        "genre_progress": _get_genre_progress(user),
        "achievements": _get_achievements(user),
    }
    return render(request, "user_profile.html", context)


@require_POST
def update_avatar(request) -> JsonResponse:
    user = _login_required(request)
    if not user:
        return JsonResponse({"error": "Login required."}, status=401)

    avatar = request.FILES.get("avatar")
    if not avatar:
        return JsonResponse({"error": "No file provided."}, status=400)

    user.avatar = avatar
    user.save(update_fields=["avatar"])
    return JsonResponse({"success": True, "avatar_url": user.avatar.url})


# ── RewardView ───────────────────────────────────────────────────────────────

def _check_balance(user: User, cost: int) -> bool:
    return user.points >= cost


def _deduct_points(user: User, cost: int) -> None:
    user.points -= cost
    user.save(update_fields=["points"])


def _sync_community_points(user: User) -> None:
    """Re-evaluate rank after a points change."""
    new_rank = Rank.objects.filter(
        min_points__lte=user.points, max_points__gte=user.points
    ).first()
    if new_rank and user.rank_id != new_rank.pk:
        user.rank = new_rank
        user.save(update_fields=["rank"])


@require_GET
def rewards(request) -> HttpResponse:
    user = _login_required(request)
    if not user:
        return redirect("login")

    all_rewards = Reward.objects.all()
    badges = _get_badge_config(user)
    return render(
        request,
        "reward.html",
        {"rewards": all_rewards, "badges": badges, "user": user},
    )


@require_POST
def redeem(request, reward_id: int) -> JsonResponse:
    user = _login_required(request)
    if not user:
        return JsonResponse({"error": "Login required."}, status=401)

    reward = get_object_or_404(Reward, pk=reward_id)

    if not _check_balance(user, reward.cost):
        return JsonResponse({"error": "Insufficient points."}, status=400)

    _deduct_points(user, reward.cost)
    RewardRedemption.objects.create(user=user, reward=reward, points_spent=reward.cost)
    _sync_community_points(user)

    return JsonResponse({"success": True, "remaining_points": user.points})


# ===========================================================================
# 4. COMMUNITY
# ===========================================================================

def _get_ranked_users():
    return User.objects.select_related("rank").order_by("-points")


def _get_top_three() -> list:
    return list(_get_ranked_users()[:3])


def _get_global_stats() -> dict:
    return {
        "total_users": User.objects.count(),
        "total_books": Book.objects.count(),
        "total_reviews": Review.objects.count(),
        "total_orders": Order.objects.count(),
    }


def _calculate_tier(points: int) -> str:
    rank = Rank.objects.filter(min_points__lte=points, max_points__gte=points).first()
    return rank.name if rank else "Unranked"


@require_GET
def leaderboard(request) -> HttpResponse:
    user = _login_required(request)
    page = _paginate(_get_ranked_users(), request.GET.get("page", 1))
    top_three = _get_top_three()
    stats = _get_global_stats()
    return render(
        request,
        "community.html",
        {"users": page, "top_three": top_three, "stats": stats, "user": user},
    )


@require_GET
def community_search(request) -> JsonResponse:
    query = request.GET.get("q", "").strip()
    if not query:
        return JsonResponse({"results": []})

    qs = User.objects.filter(
        Q(name__icontains=query) | Q(uname__icontains=query)
    ).select_related("rank").order_by("-points")[:20]

    results = [
        {
            "id": u.id,
            "name": u.name,
            "uname": u.uname,
            "points": u.points,
            "tier": _calculate_tier(u.points),
            "avatar": u.avatar.url if u.avatar else None,
        }
        for u in qs
    ]
    return JsonResponse({"results": results})


# ===========================================================================
# 5. ADMIN PANEL
# ===========================================================================

# ── DashboardView ────────────────────────────────────────────────────────────

def _get_stats() -> list:
    return list(DashboardStat.objects.order_by("sort_order"))


def _get_chart_data(period: str):
    return SalesPerformance.objects.filter(period_type=period).order_by("sort_order")


def _get_trending_books_admin():
    return Book.objects.select_related("genre").order_by("-sales")[:10]


def _get_transactions(page_num):
    qs = Order.objects.select_related("customer", "book").order_by("-date")
    return _paginate(qs, page_num)


@require_GET
def dashboard(request) -> HttpResponse:
    admin = _admin_required(request)
    if not admin:
        return redirect("login")

    period = request.GET.get("period", "weekly")
    page_num = request.GET.get("page", 1)

    context = {
        "stats": _get_stats(),
        "chart_data": _get_chart_data(period),
        "trending_books": _get_trending_books_admin(),
        "transactions": _get_transactions(page_num),
        "period": period,
        "user": admin,
    }
    return render(request, "dashboard.html", context)


@require_POST
def delete_order(request, order_id: str) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    order = get_object_or_404(Order, pk=order_id)
    order.delete()
    return JsonResponse({"success": True})


@require_GET
def download_csv(request) -> HttpResponse:
    admin = _admin_required(request)
    if not admin:
        return redirect("login")

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="orders.csv"'

    writer = csv.writer(response)
    writer.writerow(["Order ID", "Customer", "Book", "Total", "Status", "Date"])
    for o in Order.objects.select_related("customer", "book").order_by("-date"):
        writer.writerow([o.id, o.customer_name, o.book_title, o.total, o.status, o.date])

    return response


# ── InventoryView ────────────────────────────────────────────────────────────

def _get_stock_status(stock: int, max_stock: int = 100) -> str:
    if stock == 0:
        return "out_of_stock"
    if stock < max_stock * 0.2:
        return "low_stock"
    return "in_stock"


@require_GET
def inventory_index(request) -> HttpResponse:
    admin = _admin_required(request)
    if not admin:
        return redirect("login")

    qs = (
        Inventory.objects.select_related("book__genre")
        .order_by("book__title")
    )
    page = _paginate(qs, request.GET.get("page", 1))
    genres = Genre.objects.all()
    return render(request, "Book-&-inventory.html", {"inventory": page, "genres": genres, "user": admin})


@require_POST
def add_book(request) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    try:
        genre = get_object_or_404(Genre, pk=int(request.POST["genre_id"]))
        book = Book.objects.create(
            genre=genre,
            title=request.POST["title"],
            author=request.POST["author"],
            price=Decimal(request.POST["price"]),
            pages=int(request.POST["pages"]),
            published_date=request.POST.get("published_date", ""),
            description=request.POST.get("description", ""),
            cover_img=request.FILES.get("cover_img"),
        )
        Inventory.objects.create(
            book=book,
            isbn=request.POST["isbn"],
            sku=request.POST["sku"],
            stock=int(request.POST.get("stock", 0)),
            max_stock=int(request.POST.get("max_stock", 100)),
        )
        return JsonResponse({"success": True, "book_id": book.pk})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_POST
def edit_book(request, book_id: int) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    book = get_object_or_404(Book, pk=book_id)
    inventory = get_object_or_404(Inventory, book=book)

    updatable_book_fields = ["title", "author", "price", "pages", "published_date", "description"]
    for field in updatable_book_fields:
        if field in request.POST:
            setattr(book, field, request.POST[field])
    if "cover_img" in request.FILES:
        book.cover_img = request.FILES["cover_img"]
    book.save()

    if "stock" in request.POST:
        inventory.stock = int(request.POST["stock"])
    if "max_stock" in request.POST:
        inventory.max_stock = int(request.POST["max_stock"])
    inventory.save()

    return JsonResponse({"success": True, "status": _get_stock_status(inventory.stock, inventory.max_stock)})


@require_POST
def delete_book(request, book_id: int) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    book = get_object_or_404(Book, pk=book_id)
    book.delete()  # CASCADE removes Inventory, Reviews, UserBooks, Orders
    return JsonResponse({"success": True})


# ── GamificationView ─────────────────────────────────────────────────────────

_GAMIFICATION_DEFAULTS = {
    "login_points": 10,
    "review_base": 25,
    "review_bonus": 50,
    "review_min_char": 100,
    "purchase_rate": 2.0,
    "purchase_max": 500,
    "signup_bonus": 50,
}


def _load_config() -> GamificationConfig:
    return GamificationConfig.load()


def _save_config(config: GamificationConfig, data: dict) -> None:
    int_fields = ["login_points", "review_base", "review_bonus", "review_min_char", "purchase_max", "signup_bonus"]
    float_fields = ["purchase_rate"]
    for f in int_fields:
        if f in data:
            setattr(config, f, int(data[f]))
    for f in float_fields:
        if f in data:
            setattr(config, f, float(data[f]))
    config.save()


@require_GET
def gamification_index(request) -> HttpResponse:
    admin = _admin_required(request)
    if not admin:
        return redirect("login")

    config = _load_config()
    return render(request, "Gamification_Admen.html", {"config": config, "user": admin})


@require_POST
def gamification_update(request) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    config = _load_config()
    _save_config(config, request.POST)
    return JsonResponse({"success": True})


@require_POST
def gamification_reset(request) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    config = _load_config()
    _save_config(config, _GAMIFICATION_DEFAULTS)
    return JsonResponse({"success": True, "config": _GAMIFICATION_DEFAULTS})


# ── SalesRefundsView ─────────────────────────────────────────────────────────

def _calc_gross(orders) -> Decimal:
    result = orders.filter(status="completed").aggregate(total=Sum("total"))["total"]
    return result or Decimal("0.00")


def _calc_refunds(orders) -> Decimal:
    result = orders.filter(status="refunded").aggregate(total=Sum("total"))["total"]
    return result or Decimal("0.00")


@require_GET
def sales_refunds(request) -> HttpResponse:
    admin = _admin_required(request)
    if not admin:
        return redirect("login")

    all_orders = Order.objects.select_related("customer", "book")
    gross = _calc_gross(all_orders)
    refunds = _calc_refunds(all_orders)
    net = gross - refunds

    page = _paginate(all_orders.order_by("-date"), request.GET.get("page", 1))
    return render(
        request,
        "sales_refunds.html",
        {
            "orders": page,
            "gross": gross,
            "refunds": refunds,
            "net": net,
            "user": admin,
        },
    )


# ── UsersRolesView ───────────────────────────────────────────────────────────

def _filter_by_role(role: str):
    if role and role != "all":
        return User.objects.filter(role=role).select_related("rank")
    return User.objects.select_related("rank").all()


@require_GET
def users_roles(request) -> HttpResponse:
    admin = _admin_required(request)
    if not admin:
        return redirect("login")

    role = request.GET.get("role", "all")
    qs = _filter_by_role(role).order_by("name")
    page = _paginate(qs, request.GET.get("page", 1))
    return render(
        request,
        "users_roles.html",
        {"users": page, "current_role": role, "user": admin},
    )


@require_POST
def admin_add_user(request) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    email = request.POST.get("email", "").strip().lower()
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists."}, status=400)

    default_rank = Rank.objects.order_by("min_points").first()
    user = User.objects.create(
        name=request.POST.get("name", ""),
        uname=request.POST.get("uname", ""),
        email=email,
        password=_hash_password(request.POST.get("password", "")),
        role=request.POST.get("role", "customer"),
        rank=default_rank,
    )
    return JsonResponse({"success": True, "user_id": user.pk})


@require_POST
def toggle_role(request, user_id: int) -> JsonResponse:
    admin = _admin_required(request)
    if not admin:
        return JsonResponse({"error": "Unauthorized."}, status=403)

    target = get_object_or_404(User, pk=user_id)
    new_role = request.POST.get("role")
    allowed = {"admin", "customer", "staff"}
    if new_role not in allowed:
        return JsonResponse({"error": "Invalid role."}, status=400)

    target.role = new_role
    target.save(update_fields=["role"])
    return JsonResponse({"success": True, "new_role": new_role})