from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views import View
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Sum, Q

from .models import GamificationConfig, DashboardStat, SalesPerformance, Book
from .forms import GamificationConfigForm, BookForm
from Storefront.models import Order

User = get_user_model()


# =========================================================
# GAMIFICATION CONFIGURATION
# =========================================================
class GamificationAdminView(View):
    template_name = 'AdminPanel/Gamification_Admin.html'

    def getConfig(self):
        config, created = GamificationConfig.objects.get_or_create(pk=1)
        return config

    def get(self, request):
        config = self.getConfig()
        form = GamificationConfigForm(instance=config)
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        config = self.getConfig()

        if 'reset' in request.POST:
            config.delete()
            messages.info(request, "Configuration reset to default values.")
            return redirect('Gamification_Admin')

        form = GamificationConfigForm(request.POST, instance=config)

        if form.is_valid():
            form.save()
            messages.success(request, "Configuration saved successfully!")
            return redirect('Gamification_Admin')

        return render(request, self.template_name, {'form': form})


# =========================================================
# ADMIN DASHBOARD
# =========================================================
class AdminDashboardView(ListView):
    template_name = "AdminPanel/dashboard.html"
    context_object_name = "recent_orders"
    model = Order
    paginate_by = 5

    def get_queryset(self):
        return Order.objects.all().order_by('-date')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['stats'] = DashboardStat.objects.all().order_by('sort_order')

        context['sales_data'] = SalesPerformance.objects.filter(
            period_type='weekly'
        ).order_by('sort_order')

        from Storefront.models import Book
        context['trending_books'] = Book.objects.all().order_by('-sales')[:4]

        return context


class OrderDeleteView(View):

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        order.delete()
        return redirect('dashboard')


# =========================================================
# INVENTORY MANAGEMENT
# =========================================================
class InventoryDashboardView(ListView):
    model = Book
    template_name = 'AdminPanel/Book-&-inventory.html'
    context_object_name = 'page_obj'
    paginate_by = 5
    ordering = ['-id']


class BookBaseView:
    model = Book
    form_class = BookForm
    template_name = 'AdminPanel/book_form.html'
    success_url = reverse_lazy('inventory_dashboard')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = self.object is not None
        return context


class BookCreateView(BookBaseView, CreateView):
    pass


class BookUpdateView(BookBaseView, UpdateView):
    pass


class BookDeleteView(DeleteView):
    model = Book
    success_url = reverse_lazy('inventory_dashboard')

    def post(self, request, *args, **kwargs):
        book = self.get_object()
        messages.warning(request, f"Book '{book.title}' has been removed from inventory.")
        return super().post(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)


# =========================================================
# SALES & REFUNDS
# =========================================================
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


# =========================================================
# USERS & ROLES
# =========================================================
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
