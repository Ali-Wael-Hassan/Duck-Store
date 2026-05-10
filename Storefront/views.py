import uuid
from django.views import View
from django.views.generic import ListView
from datetime import date
from decimal import Decimal

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from django.views.decorators.http import require_GET, require_POST
from django.db.models import Avg

from Authentication.models import User
from Community.models import Badge, UserBadge
from Storefront.models import Book, Review, Inventory, Order, FeaturedPromo, UserBook, CuratedConfig, Genre
from AdminPanel.models import GamificationConfig


PAGE_SIZE = 10


class SharedHelper:
    @staticmethod
    def loginRequired(request):
        # gets the user session
        session_id = request.session.get("session_id")
        if not session_id:
            return None
        
        # gets the user from the DB
        return User.objects.filter(session_id=session_id).first()

    @staticmethod
    def paginate(queryset, page_number, per_page=PAGE_SIZE):
        # delegates the pagination to django built-in class
        paginator = Paginator(queryset, per_page)
        return paginator.get_page(page_number)

    @staticmethod
    def _checkAndAwardBadges(user: User) -> None:
        # get the unlocked badges
        eligible = Badge.objects.filter(requirement__lte=user.points)
        # gets the badge id of the awarded badges of the user
        already_awarded = UserBadge.objects.filter(user=user).values_list("badge_id", flat=True)
        for badge in eligible:
            # if the user didn't unlock the badge then unlock it
            if badge.pk not in already_awarded:
                UserBadge.objects.create(user=user, badge=badge)

    @staticmethod
    def _getFeaturedPromos():
        # eturns active promos queryset
        return FeaturedPromo.objects.filter(is_active=True)



# Helper Class
class BookActionHelper:

    @staticmethod
    def checkOwnership(user: User, book_id: int) -> bool:
        # checks whether the user owns the book or not
        return UserBook.objects.filter(user=user, book_id=book_id).exists()

    @staticmethod
    def _awardReviewPoints(user: User, comment: str) -> int:
        # gets the config for rewards
        config = GamificationConfig.load()
        points = config.review_base
        
        # validates the length of the review and calculate points
        if len(comment or "") >= config.review_min_char:
            points += config.review_bonus
        user.points += points
        user.reviews = (user.reviews or 0) + 1
        
        # save query for the updated fields
        user.save(update_fields=["points", "reviews"])
        
        # update badges
        SharedHelper._checkAndAwardBadges(user)
        return points

    @staticmethod
    def _awardPurchasePoints(user: User, price: Decimal) -> int:
        # gets the config for rewards
        config = GamificationConfig.load()
        
        # limit the bonus of purshase
        earned = min(int(float(price) * config.purchase_rate), config.purchase_max)
        user.points += earned
        
        # updates user readings
        user.readings = (user.readings or 0) + 1
        
        # save query for the updated fields
        user.save(update_fields=["points", "readings"])
        
        # update badges
        SharedHelper._checkAndAwardBadges(user)
        return earned

class BookView:

    class BookDetailTemplate:
        @staticmethod
        def build_context(book: Book) -> dict:
            return {
                "synopsis": (book.description or "").strip() or "No synopsis available for this book.",
                "cover": book.cover_img.url if book.cover_img else None,
                "rating": float(book.rating or 0.0),
            }

    @staticmethod
    def _action_pipeline(request, book_id: int, logic_func):
        # Pipeline to check login and then perform the action logic
        user = SharedHelper.loginRequired(request)
        if not user:
            return JsonResponse({"error": "Login required."}, status=401)
        book = get_object_or_404(Book, pk=book_id)
        
        # If validation passed, do the logic
        return logic_func(request, user, book)

    @staticmethod
    @require_GET
    def detail(request, book_id: int) -> HttpResponse:  # URL-mapped
        book = get_object_or_404(Book.objects.select_related("genre", "inventory"), pk=book_id)
        reviews = Review.objects.filter(book=book).order_by("-created_at")[:5]
        user = SharedHelper.loginRequired(request)
        owned = BookActionHelper.checkOwnership(user, book_id) if user else False
        featured = SharedHelper._getFeaturedPromos().first()
        context = {
            "book": book,
            "reviews": reviews,
            "owned": owned,
            "user": user,
            "featured": featured,
            "book_detail": BookView.BookDetailTemplate.build_context(book),
        }
        return render(request, "book-view.html", context)

    @staticmethod
    @require_POST
    def buy(request, book_id: int) -> JsonResponse:  # URL-mapped
        def logic(req, current_user, current_book):
            inventory = get_object_or_404(Inventory, book=current_book)
            if inventory.stock < 1:
                return JsonResponse({"error": "Out of stock."}, status=400)
            if BookActionHelper.checkOwnership(current_user, current_book.id):
                return JsonResponse({"error": "Already owned."}, status=400)
            order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
            Order.objects.create(
                id=order_id, customer=current_user, customer_name=current_user.name,
                book=current_book, book_title=current_book.title,
                total=current_book.price, status="completed", date=date.today(),
            )
            UserBook.objects.create(user=current_user, book=current_book, ownership_type="bought")
            inventory.stock -= 1
            inventory.save(update_fields=["stock"])
            current_book.sales = (current_book.sales or 0) + 1
            current_book.save(update_fields=["sales"])
            pts = BookActionHelper._awardPurchasePoints(current_user, current_book.price)
            return JsonResponse({"success": True, "order_id": order_id, "points_earned": pts})
        return BookView._action_pipeline(request, book_id, logic)

    @staticmethod
    @require_POST
    def borrow(request, book_id: int) -> JsonResponse:  # URL-mapped
        def logic(req, current_user, current_book):
            if BookActionHelper.checkOwnership(current_user, current_book.id):
                return JsonResponse({"error": "Already in your library."}, status=400)
            UserBook.objects.create(user=current_user, book=current_book, ownership_type="rented")
            return JsonResponse({"success": True})
        return BookView._action_pipeline(request, book_id, logic)

    @staticmethod
    @require_POST
    def add_review(request, book_id: int) -> JsonResponse:  # URL-mapped
        def logic(req, current_user, current_book):
            rating = int(req.POST.get("rating", 0))
            comment = req.POST.get("comment", "").strip()
            if not (1 <= rating <= 5):
                return JsonResponse({"error": "Rating must be between 1 and 5."}, status=400)
            Review.objects.create(
                book=current_book, user=current_user, user_name=current_user.name,
                rating=rating, comment=comment
            )
            avg = Review.objects.filter(book=current_book).aggregate(a=Avg("rating"))["a"] or 0.0
            current_book.rating = round(avg, 2)
            current_book.save(update_fields=["rating"])
            pts = BookActionHelper._awardReviewPoints(current_user, comment)
            return JsonResponse({"success": True, "points_earned": pts, "new_rating": current_book.rating})

        return BookView._action_pipeline(request, book_id, logic)



class HomeView(View):
    template_name = 'Storefront/home.html'

    def get(self, request):
        
        featured_promos = FeaturedPromo.objects.filter(is_active=True)
        trending_books = Book.objects.order_by('-sales')[:7]
        
        curated_setup = CuratedConfig.objects.first()
        curated_books = []
        if curated_setup:
            curated_books = Book.objects.filter(
                genre=curated_setup.display_genre
            )[:curated_setup.limit]

        context = {
            'featured_promos': featured_promos,
            'trending_books': trending_books,
            'curated_books': curated_books,
            'curated_config': curated_setup,
        }
        return render(request, self.template_name, context)
    
class CatalogView(ListView):
    model = Book
    template_name = 'Storefront/store.html'
    context_object_name = 'page_obj'
    paginate_by = PAGE_SIZE

    def get_queryset(self):
        # Handles filtering by category, price range, and sorting.
        queryset = Book.objects.all()
        
        # Get Filter Params
        category = self.request.GET.get('category')
        sort_by = self.request.GET.get('sort', 'popularity')
        min_price = self.request.GET.get('minPrice')
        max_price = self.request.GET.get('maxPrice')

        # Filter by Category
        if category and category.strip():
            queryset = queryset.filter(genre__name__iexact=category)

        # Filter by Price Range
        try:
            if min_price and min_price.strip():
                queryset = queryset.filter(price__gte=float(min_price))
            if max_price and max_price.strip():
                queryset = queryset.filter(price__lte=float(max_price))
        except ValueError:
            pass 

        # Sorting Logic
        sort_mapping = {
            'price-low': 'price',
            'price-high': '-price',
            'title': 'title',
            'popularity': '-sales'
        }
        
        order_field = sort_mapping.get(sort_by, '-sales')
        return queryset.order_by(order_field)

    def get_context_data(self, **kwargs):
        """
        Adds extra context like genres and the current sort state.
        """
        context = super().get_context_data(**kwargs)
        context['genres'] = Genre.objects.all()
        context['current_sort'] = self.request.GET.get('sort', 'popularity')
        return context