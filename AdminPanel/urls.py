from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.InventoryDashboardView.as_view(), name='inventory_dashboard'),

    # Add New Book
    path('add/', views.BookCreateView.as_view(), name='add_book'),

    # Edit Existing Book
    path('edit/<int:pk>/', views.BookUpdateView.as_view(), name='edit_book'),

    # Delete Book
    path('delete/<int:pk>/', views.BookDeleteView.as_view(), name='delete_book'),
]