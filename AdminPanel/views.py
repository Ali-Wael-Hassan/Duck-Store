from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.contrib import messages
from django.db.models import Sum, Q
from .models import Order, GamificationConfig

User = get_user_model()

class SalesRefundsView(View):
    def get(self, request):
        orders_qs = Order.objects.all().order_by('-date')
        
        refund_filter = Q(status__iexact='Refunded') | Q(status__iexact='Refund')
        
        gross_sales = orders_qs.exclude(refund_filter).aggregate(Sum('total'))['total__sum'] or 0
        total_refunds = orders_qs.filter(refund_filter).aggregate(Sum('total'))['total__sum'] or 0
        net_sales = gross_sales - total_refunds

        paginator = Paginator(orders_qs, 5)
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

class UsersRolesIndexView(View):
    def get(self, request):
        role_filter = request.GET.get('role', 'all').lower()
        search_query = request.GET.get('search', '')

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

class AddUserView(View):
    def post(self, request):
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            if role == 'admin':
                user.is_staff = True
                user.save()
            messages.success(request, f"User {username} created successfully!")
            
        return redirect('users_roles_index')

class ToggleUserRoleView(View):
    def post(self, request, user_id):
        target_user = get_object_or_404(User, id=user_id)
        
        if target_user == request.user:
            messages.error(request, "You cannot change your own role to prevent lockout.")
        else:
            target_user.is_staff = not target_user.is_staff
            target_user.save()
            
            new_role = "Admin" if target_user.is_staff else "User"
            messages.success(request, f"Updated {target_user.username} to {new_role}.")
            
        return redirect('users_roles_index')

class GamificationConfigMixin:
    def _get_config(self):
        config, created = GamificationConfig.objects.get_or_create(id=1)
        return config