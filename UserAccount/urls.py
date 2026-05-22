from django.urls import path
from . import views

urlpatterns = [
    path("my-books/", views.MyBooksView.index, name="my_books"),
    path("api/my-books/<str:filter_type>/", views.MyBooksView.filter, name="my_books_filter"),

    path("profile/", views.UserProfileView.index, name="user_profile"),
    path("api/profile/update-avatar/", views.UserProfileView.updateAvatar, name="update_avatar"),
]