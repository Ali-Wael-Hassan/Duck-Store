from django.urls import path
from . import views
# from .views import Your Views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('catalog/', views.catalog_view, name='catalog'),
    
    # Add these placeholders so the {% url %} tags in your HTML work
    path('my-books/', views.home_view, name='my_books'), # Temporary: points to home
    path('community/', views.home_view, name='community'), # Temporary
    path('rewards/', views.home_view, name='rewards'), # Temporary
    path('profile/', views.home_view, name='profile'), # Temporary
    path('book/<int:id>/', views.home_view, name='book_detail'), # Temporary
]
