from django.urls import path
from . import views

urlpatterns = [
    path('book/<int:book_id>/', views.book_detail_view, name='book_detail'),
    
    # Add these two lines
    path('book/<int:book_id>/review/', views.add_review, name='add_review'),
    path('book/<int:book_id>/action/<str:action_type>/', views.handle_book_action, name='book_action'),
]