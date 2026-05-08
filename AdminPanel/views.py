from django.shortcuts import render
from django.core.paginator import Paginator
from django.db.models import Sum, Q
from .models import Order  # [cite: 26]
from django.shortcuts import render
from django.core.paginator import Paginator
from django.db.models import Sum, Q
from .models import Order  # [cite: 26]
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from django.contrib import messages

User = get_user_model()
def sales_refunds_view(request):
    # Fetch all orders ordered by date 
    orders_qs = Order.objects.all().order_by('-date')

    # Calculate Stats (Logic from JS renderStats) 
    # Filter for statuses that count as refunds
    refund_filter = Q(status__iexact='Refunded') | Q(status__iexact='Refund')
    
    gross_sales = orders_qs.exclude(refund_filter).aggregate(Sum('total'))['total__sum'] or 0
    total_refunds = orders_qs.filter(refund_filter).aggregate(Sum('total'))['total__sum'] or 0
    net_sales = gross_sales - total_refunds

    # Pagination Logic (Logic from JS renderTable) 
    rows_per_page = 5
    paginator = Paginator(orders_qs, rows_per_page)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'stat_gross': gross_sales,
        'stat_refunds': total_refunds,
        'stat_net': net_sales,
        'page_obj': page_obj,
        'total_count': orders_qs.count(),
    }
    
    return render(request, 'AdminPanel/sales_refunds.html', context)

def sales_refunds_view(request):
    # Fetch all orders ordered by date 
    orders_qs = Order.objects.all().order_by('-date')

    # Calculate Stats (Logic from JS renderStats) 
    # Filter for statuses that count as refunds
    refund_filter = Q(status__iexact='Refunded') | Q(status__iexact='Refund')
    
    gross_sales = orders_qs.exclude(refund_filter).aggregate(Sum('total'))['total__sum'] or 0
    total_refunds = orders_qs.filter(refund_filter).aggregate(Sum('total'))['total__sum'] or 0
    net_sales = gross_sales - total_refunds

    # Pagination Logic (Logic from JS renderTable) 
    rows_per_page = 5
    paginator = Paginator(orders_qs, rows_per_page)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'stat_gross': gross_sales,
        'stat_refunds': total_refunds,
        'stat_net': net_sales,
        'page_obj': page_obj,
        'total_count': orders_qs.count(),
    }
    
    return render(request, 'AdminPanel/sales_refunds.html', context)
# In your views.py
def _load_config():
    # Returns the first config object, or creates one if it doesn't exist
    config, created = GamificationConfig.objects.get_or_create(id=1)
    return config




# This ensures we use whichever user model is defined in settings.py


def users_roles_index(request):
    """
    Main view for listing users, filtering by role, and handling pagination.
    """
    # 1. Get Filter and Search Parameters
    role_filter = request.GET.get('role', 'all').lower()
    search_query = request.GET.get('search', '')

    # 2. Build the Query
    user_list = User.objects.all().order_by('-date_joined')

    if role_filter == 'admin':
        user_list = user_list.filter(is_staff=True)
    elif role_filter == 'user':
        user_list = user_list.filter(is_staff=False)

    if search_query:
        user_list = user_list.filter(
            Q(username__icontains=search_query) | 
            Q(email__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        )

    # 3. Pagination (5 users per page as per your JS logic)
    paginator = Paginator(user_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'current_filter': role_filter,
        'search_query': search_query,
        'total_count': user_list.count(),
    }
    return render(request, 'AdminPanel/users_roles.html', context)

def toggle_user_role(request, user_id):
    """
    View to switch a user between 'Admin' (staff) and 'User'.
    """
    if request.method == "POST":
        target_user = get_object_or_404(User, id=user_id)
        
        # Security: Prevent an admin from deactivating themselves
        if target_user == request.user:
            messages.error(request, "You cannot change your own role to prevent lockout.")
        else:
            # Toggle is_staff (True becomes False, False becomes True)
            target_user.is_staff = not target_user.is_staff
            target_user.save()
            
            new_role = "Admin" if target_user.is_staff else "User"
            messages.success(request, f"Updated {target_user.username} to {new_role}.")
            
    return redirect('users_roles_index')


def add_user(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            if role == 'admin':
                user.is_staff = True
                user.save()
            messages.success(request, f"User {username} created successfully!")
        
        # This redirect is what refreshes the page and closes the modal
        return redirect('users_roles_index') 
    
    return redirect('users_roles_index')