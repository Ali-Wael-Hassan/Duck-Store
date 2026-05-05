from django.urls import path
from . import views
from .views import AdminDashboardView, OrderDeleteView

urlpatterns = [
    
    path('gamification-admin/', views.GamificationAdminView.as_view(), name='Gamification_Admin'),
    
    path('dashboard/', views.AdminDashboardView.as_view(), name='dashboard'),

    path('order/delete/<int:order_id>/', views.OrderDeleteView.as_view(), name='delete_order'),
]