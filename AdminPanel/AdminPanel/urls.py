from django.urls import path
from . import views
from .views import (
    AdminDashboardView, OrderDeleteView,
    InventoryDashboardView, BookCreateView, BookUpdateView, BookDeleteView,
    SalesRefundsView, UsersRolesIndexView, AddUserView, ToggleUserRoleView,
)

urlpatterns = [
    # Gamification Config
    path('gamification-admin/', views.GamificationAdminView.as_view(), name='Gamification_Admin'),

    # Dashboard
    path('', AdminDashboardView.as_view(), name='dashboard'),

    # Order Management
    path('order/delete/<int:order_id>/', OrderDeleteView.as_view(), name='delete_order'),

    # Inventory Management
    path('inventory/', InventoryDashboardView.as_view(), name='inventory_dashboard'),
    path('inventory/add/', BookCreateView.as_view(), name='add_book'),
    path('inventory/edit/<int:pk>/', BookUpdateView.as_view(), name='edit_book'),
    path('inventory/delete/<int:pk>/', BookDeleteView.as_view(), name='delete_book'),

    # Sales & Refunds
    path('sales-refunds/', SalesRefundsView.as_view(), name='sales_refunds_index'),

    # Users & Roles
    path('users/', UsersRolesIndexView.as_view(), name='users_roles_index'),
    path('users/add/', AddUserView.as_view(), name='add_user'),
    path('users/toggle/<int:user_id>/', ToggleUserRoleView.as_view(), name='toggle_user_role'),
]
