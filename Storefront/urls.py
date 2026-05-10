from django.urls import path
<<<<<<< HEAD
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
=======
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('book/<int:book_id>/', views.BookDetailView.as_view(), name='book_detail'),
    path('book/<int:book_id>/review/', views.AddReviewView.as_view(), name='add_review'),
    path('book/<int:book_id>/action/<str:action_type>/', views.BookActionView.as_view(), name='book_action'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # This allows images to load
>>>>>>> be0a2b60eb63af18f99b35217a3412662200d247
