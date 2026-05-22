from django.urls import path
from .views import (
    HomeView,
    CatalogView,
    BookDetailView,
    BookBuyView,
    BookBorrowView,
    BookReviewView,
)

urlpatterns = [
    path("", HomeView.as_view(), name="home"),
    path("store/", CatalogView.as_view(), name="store"),
    path("book/<int:book_id>/", BookDetailView.as_view(), name="book_detail"),
    path("api/book/<int:book_id>/buy/", BookBuyView.as_view(), name="buy_book"),
    path("api/book/<int:book_id>/borrow/", BookBorrowView.as_view(), name="borrow_book"),
    path("api/book/<int:book_id>/review/", BookReviewView.as_view(), name="add_review"),
]
