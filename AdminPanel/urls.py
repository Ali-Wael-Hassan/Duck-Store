from django.urls import path
from . import views

urlpatterns = [
    # Main Inventory Table
    # URL: http://127.0.0.1:8000/admin-panel/
    path('', views.inventory_dashboard, name='inventory_dashboard'),

    # Add New Book
    # URL: http://127.0.0.1:8000/admin-panel/add/
    path('add/', views.manage_book, name='add_book'),

    # Edit Existing Book
    # URL: http://127.0.0.1:8000/admin-panel/edit/5/
    path('edit/<int:pk>/', views.manage_book, name='edit_book'),

    # Delete Book
    # URL: http://127.0.0.1:8000/admin-panel/delete/5/
    path('delete/<int:pk>/', views.delete_book, name='delete_book'),
]