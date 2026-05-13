from django.urls import path
from . import views
from .views import (
    AdminDashboardView, OrderDeleteView,
    InventoryDashboardView, BookCreateView, BookUpdateView, BookDeleteView,
    UsersRolesIndexView, AddUserView, ToggleUserRoleView, ExportOrdersCSVView, GamificationAdminView,
    FeaturedPromoCreateView, FeaturedPromoUpdateView, FeaturedPromoDeleteView, FeaturedPromoListView,
    CuratedConfigListView, CuratedConfigCreateView, CuratedConfigUpdateView, CuratedConfigDeleteView,
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
    path('users/', UsersRolesIndexView.as_view(), name='roles'),
    path('users/add/', AddUserView.as_view(), name='add_user'),
    path('users/toggle/<int:user_id>/', ToggleUserRoleView.as_view(), name='toggle_user_role'),
    path('featured-promos/', FeaturedPromoListView.as_view(), name='list_featured_promos'),
    path('featured-promo/add/', FeaturedPromoCreateView.as_view(), name='add_featured_promo'),
    path('featured-promo/edit/<int:pk>/', FeaturedPromoUpdateView.as_view(), name='edit_featured_promo'),
    path('featured-promo/delete/<int:pk>/', FeaturedPromoDeleteView.as_view(), name='delete_featured_promo'),
    path('curated-configs/', CuratedConfigListView.as_view(), name='list_curated_configs'),
    path('curated-config/add/', CuratedConfigCreateView.as_view(), name='add_curated_config'),
    path('curated-config/edit/<int:pk>/', CuratedConfigUpdateView.as_view(), name='edit_curated_config'),
    path('curated-config/delete/<int:pk>/', CuratedConfigDeleteView.as_view(), name='delete_curated_config'),
]
