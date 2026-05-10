from django.urls import path
from . import views
from .views import HomeView, CatalogView

urlpatterns = [
    path("book-view.html", views.BookView.detail, name="book_detail_html"),
    path("book/<int:book_id>/", views.BookView.detail, name="book_detail"),
    path("api/book/<int:book_id>/buy/", views.BookView.buy, name="buy_book"),
    path("api/book/<int:book_id>/borrow/", views.BookView.borrow, name="borrow_book"),
    path("api/book/<int:book_id>/review/", views.BookView.add_review, name="add_review"),
    path('', HomeView.as_view(), name='home'),
    path('store/', CatalogView.as_view(), name='store'),
]