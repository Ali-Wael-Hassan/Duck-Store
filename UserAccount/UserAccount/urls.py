from django.urls import path
from . import views

urlpatterns = [
    # ============================================================
    # MY BOOKS — Task 2
    # ============================================================
    path("my-Books.html", views.MyBooksView.index, name="my_books"),
    path("api/my-books/<str:filter_type>/", views.MyBooksView.filter, name="my_books_filter"),

    # ============================================================
    # USER PROFILE — Task 3
    # ============================================================
    path("user_profile.html", views.UserProfileView.index, name="user_profile"),
    path("api/profile/update-avatar/", views.UserProfileView.updateAvatar, name="update_avatar"),
]