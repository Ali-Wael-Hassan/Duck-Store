from django.urls import path
from .views import SalesRefundsView, UsersRolesIndexView, AddUserView, ToggleUserRoleView

urlpatterns = [
    # Sales & Refunds
    path('sales-refunds/', SalesRefundsView.as_view(), name='sales_refunds_index'),
    
    # Users & Roles Index (Listing, Filtering, Search)
    path('users/', UsersRolesIndexView.as_view(), name='users_roles_index'),
    
    # Add User Action
    path('users/add/', AddUserView.as_view(), name='add_user'),
    
    # Toggle User Role Action
    path('users/toggle/<int:user_id>/', ToggleUserRoleView.as_view(), name='toggle_user_role'),
]