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
    # Pages
    path("", HomeView.as_view(), name="home"),
    path("store/", CatalogView.as_view(), name="store"),

    # Book pages
    path("book/<int:book_id>/", BookDetailView.as_view(), name="book_detail"),

    # API actions
    path('book/<int:book_id>/buy/', BookBuyView.as_view(), name='buy_book'),
    path('book/<int:book_id>/borrow/', BookBorrowView.as_view(), name='borrow_book'),
    path('book/<int:book_id>/review/', BookReviewView.as_view(), name='review_book'),
]