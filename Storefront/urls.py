from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('book/<int:book_id>/', views.BookDetailView.as_view(), name='book_detail'),
    path('book/<int:book_id>/review/', views.AddReviewView.as_view(), name='add_review'),
    path('book/<int:book_id>/action/<str:action_type>/', views.BookActionView.as_view(), name='book_action'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # This allows images to load