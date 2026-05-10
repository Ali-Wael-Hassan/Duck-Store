from django.urls import path
from . import views
<<<<<<< HEAD
from .views import AdminDashboardView, OrderDeleteView

urlpatterns = [
    
    path('gamification-admin/', views.GamificationAdminView.as_view(), name='Gamification_Admin'),
    
    path('', views.AdminDashboardView.as_view(), name='dashboard'),

    path('order/delete/<int:order_id>/', views.OrderDeleteView.as_view(), name='delete_order'),
=======

urlpatterns = [
    # Dashboard
    path('', views.InventoryDashboardView.as_view(), name='inventory_dashboard'),

    # Add New Book
    path('add/', views.BookCreateView.as_view(), name='add_book'),

    # Edit Existing Book
    path('edit/<int:pk>/', views.BookUpdateView.as_view(), name='edit_book'),

    # Delete Book
    path('delete/<int:pk>/', views.BookDeleteView.as_view(), name='delete_book'),
>>>>>>> be0a2b60eb63af18f99b35217a3412662200d247
]