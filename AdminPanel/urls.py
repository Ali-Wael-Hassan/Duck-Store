from django.urls import path
from . import views
from .views import (
    AdminDashboardView, OrderDeleteView,
    InventoryDashboardView, BookCreateView, BookUpdateView, BookDeleteView,
    SalesRefundsView, UsersRolesIndexView, AddUserView, ToggleUserRoleView, ExportOrdersCSVView, GamificationAdminView
)

urlpatterns = [
    path('dashboard/export-csv/', ExportOrdersCSVView.as_view(), name='export_orders_csv'),
    path('gamification/', GamificationAdminView.as_view(), name='gamification'),
    path('', AdminDashboardView.as_view(), name='dashboard'),
    path('order/delete/<str:order_id>/', OrderDeleteView.as_view(), name='delete_order'),
    path('inventory/', InventoryDashboardView.as_view(), name='inventory'),
    path('book/add/', BookCreateView.as_view(), name='add_book'),
    path('book/edit/<int:pk>/', BookUpdateView.as_view(), name='edit_book'),
    path('book/delete/<int:pk>/', BookDeleteView.as_view(), name='delete_book'),
    path('sales/', SalesRefundsView.as_view(), name='sales'),
    path('users/', UsersRolesIndexView.as_view(), name='roles'),
    path('users/add/', AddUserView.as_view(), name='add_user'),
    path('users/toggle/<int:user_id>/', ToggleUserRoleView.as_view(), name='toggle_user_role'),
]
