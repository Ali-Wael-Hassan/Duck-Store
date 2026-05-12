from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.db.models import Count
from django.views.decorators.http import require_GET, require_POST
from Authentication.models import User, Rank
from Storefront.models import UserBook
from Community.models import UserBadge

# Create your views here.

class MyBooksView:

    class MyBooksHelper:
        @staticmethod
        def _getOwnedBooks(user: User):
            return UserBook.objects.filter(
                user=user,
                ownership_type="bought"
            ).select_related("book")

        @staticmethod
        def _getBorrowedBooks(user: User):
            return UserBook.objects.filter(
                user=user,
                ownership_type="rented"
            ).select_related("book")


    @staticmethod
    @require_GET
    def index(request) -> HttpResponse:

        if not request.user.is_authenticated:
            return redirect("login")

        user = request.user

        tab = request.GET.get("tab", "all")

        if tab == "owned":
            library = MyBooksView.MyBooksHelper._getOwnedBooks(user)
        elif tab == "borrowed":
            library = MyBooksView.MyBooksHelper._getBorrowedBooks(user)
        else:
            library = UserBook.objects.filter(user=user).select_related("book")

        # simple pagination (keep your old function if you have one)
        from django.core.paginator import Paginator
        paginator = Paginator(library, 12)
        page_number = request.GET.get("page")
        page = paginator.get_page(page_number)

        context = {
            "library": page,
            "tab": tab,
            "user": user,
        }

        return render(request, "UserAccount/my-Books.html", context)


    @staticmethod
    @require_GET
    def filter(request, filter_type: str) -> JsonResponse:

        if not request.user.is_authenticated:
            return JsonResponse({"error": "Login required."}, status=401)

        user = request.user

        mapping = {
            "owned": MyBooksView.MyBooksHelper._getOwnedBooks,
            "borrowed": MyBooksView.MyBooksHelper._getBorrowedBooks,
        }

        qs_fn = mapping.get(filter_type)
        qs = qs_fn(user) if qs_fn else UserBook.objects.filter(user=user)

        from django.core.paginator import Paginator
        paginator = Paginator(qs, 12)
        page = paginator.get_page(request.GET.get("page"))

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

        return JsonResponse({
            "books": data,
            "has_next": page.has_next()
        })




# == UserProfileView =========================================

class UserProfileView:

    class UserProfileHelper:
        @staticmethod
        def _getRankTier(user: User):
            return user.get_tier()

        @staticmethod
        def _getBadgeConfig(user: User):
            return list(
                UserBadge.objects.filter(user=user)
                .select_related("badge")
                .values("badge__name", "badge__icon", "badge__color", "badge__level", "unlocked_at")
            )

        @staticmethod
        def _getGenreProgress(user: User):
            return (
                UserBook.objects.filter(user=user)
                .values("book__genre__name", "book__genre__slug")
                .annotate(count=Count("id"))
                .order_by("-count")
            )

        @staticmethod
        def _getAchievements(user: User):
            return list(
                UserBadge.objects.filter(user=user)
                .select_related("badge")
                .order_by("-unlocked_at")
                .values("badge__name", "badge__icon", "badge__level", "unlocked_at")
            )


    @staticmethod
    @require_GET
    def index(request):

        if not request.user.is_authenticated:
            return redirect("login")

        user = request.user

        rank = Rank.objects.filter(
            min_points__lte=user.points,
            max_points__gte=user.points
        ).first()

        context = {
            "user": user,
            "rank": rank,
            "tier": UserProfileView.UserProfileHelper._getRankTier(user),
            "global_rank": user.get_global_rank(),
            "badges": UserProfileView.UserProfileHelper._getBadgeConfig(user),
            "genre_progress": UserProfileView.UserProfileHelper._getGenreProgress(user),
            "achievements": UserProfileView.UserProfileHelper._getAchievements(user),
        }

        return render(request, "UserAccount/user_profile.html", context)


    @staticmethod
    @require_POST
    def updateAvatar(request):

        if not request.user.is_authenticated:
            return JsonResponse({"error": "Login required."}, status=401)

        user = request.user

        avatar = request.FILES.get("avatar")
        if not avatar:
            return JsonResponse({"error": "No file provided."}, status=400)

        user.avatar = avatar
        user.save(update_fields=["avatar"])

        return JsonResponse({"success": True, "avatar_url": user.avatar.url})