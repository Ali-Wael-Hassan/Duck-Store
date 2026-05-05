from django.urls import path
from . import views

urlpatterns = [
    # This matches the link in your sidebar: <a href="Gamification_Admen.html">
    path('gamification-admin/', views.gamification_admin_view, name='Gamification_Admin'),
    # Dashboard route
    path('dashboard/', views.AdminDashboardView.as_view(), name='dashboard'),
    # Delete action route
    path('order/delete/<int:order_id>/', views.OrderDeleteView.as_view(), name='delete_order'),

    # Route for the delete button in the transactions table
    path('order/delete/<int:order_id>/', views.delete_order, name='delete_order'),
    # Route for the "Download CSV" button
    path('dashboard/download-csv/', views.download_transactions_csv, name='download_csv'),
    # Route for updating the Sales Performance chart via AJAX
    path('api/sales-data/<str:chart_type>/', views.get_sales_data, name='sales_data'),
]