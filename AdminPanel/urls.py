from django.urls import path
from . import views

urlpatterns = [
    # Mapping the Sales & Refunds index view
    path('sales-refunds/', views.sales_refunds_view, name='sales_refunds_index'),
    path('users/', views.users_roles_index, name='users_roles_index'),
    path('users/add/', views.add_user, name='add_user'),
path('users/toggle/<int:user_id>/', views.toggle_user_role, name='toggle_user_role'),
]