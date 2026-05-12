from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views import View
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Sum, Q

import csv
from .models import GamificationConfig, DashboardStat, SalesPerformance
from .forms import AddUserForm, GamificationConfigForm, BookForm
from Storefront.models import Inventory, Order, Book

User = get_user_model()


class GamificationAdminView(View):
    template_name = 'AdminPanel/gamification.html'

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
            return redirect('gamification')

        form = GamificationConfigForm(request.POST, instance=config)
        
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration saved successfully!")
            return redirect('gamification')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"Error in {field}: {error}")
            return redirect('gamification')


class AdminDashboardView(ListView):
    template_name = "AdminPanel/dashboard.html"
    context_object_name = "recent_orders"
    model = Order
    paginate_by = 5

    def get_queryset(self):
        return Order.objects.all().order_by('-date')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # 1. Handle Period Toggling
        period = self.request.GET.get('period', 'weekly').lower()
        if period not in ['weekly', 'monthly']:
            period = 'weekly'

        context['current_period'] = period

        # 2. Fetch Stats
        context['stats'] = DashboardStat.objects.all().order_by('sort_order')

        # 3. Fetch Sales Performance Data
        # fill_height is already a percentage (0-100) relative to total_height
        context['sales_data'] = SalesPerformance.objects.filter(
            period_type=period
        ).order_by('sort_order')

        # 4. Trending Books
        context['trending_books'] = Book.objects.all().order_by('-sales')[:4]

        # 5. Fix for Transaction Amount Mismatch
        for order in context['recent_orders']:
            order.total_amount = order.total

        return context


class OrderDeleteView(View):
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        order.delete()
        messages.success(request, f"Order #{order_id} deleted successfully.")
        return redirect('dashboard')


class ExportOrdersCSVView(View):
    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="Transactions_Export.csv"'

        writer = csv.writer(response)
        writer.writerow(['Order ID', 'Customer', 'Date', 'Amount', 'Status'])

        orders = Order.objects.all().order_by('-date')
        for order in orders:
            writer.writerow([
                order.id,
                order.customer_name,
                order.date.strftime("%Y-%m-%d") if order.date else "",
                order.total,
                order.status
            ])

        return response

class InventoryDashboardView(ListView):
    model = Inventory
    template_name = 'AdminPanel/Book-&-inventory.html'
    context_object_name = 'inventory_list'
    paginate_by = 5
    ordering = ['-id']


class BookBaseView:
    model = Book
    form_class = BookForm
    template_name = 'AdminPanel/book_form.html'
    success_url = reverse_lazy('inventory')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = self.object is not None
        return context


class BookCreateView(BookBaseView, CreateView):
    def form_valid(self, form):
        # 1. Save the Book first
        response = super().form_valid(form)
        
        # 2. Get the stock value from the cleaned form data
        stock_value = form.cleaned_data.get('stock')
        isbn_value = form.cleaned_data.get('isbn')
        sku_value = form.cleaned_data.get('sku')
        # 3. Create or update the Inventory record for this book
        # Assuming Inventory has a field named 'book' that links to Book
        Inventory.objects.update_or_create(
            book=self.object, 
            defaults={
                'stock': stock_value,
                'isbn': isbn_value,
                'sku': sku_value
            }
        )
        
        return response


class BookUpdateView(BookBaseView, UpdateView):
    def get_initial(self):
        initial = super().get_initial()
        # Look up the stock for this specific book
        inventory_item = Inventory.objects.filter(book=self.get_object()).first()
        if inventory_item:
            initial['stock'] = inventory_item.stock
            initial['isbn'] = inventory_item.isbn
            initial['sku'] = inventory_item.sku
        return initial

    def form_valid(self, form):
        response = super().form_valid(form)
        stock_value = form.cleaned_data.get('stock')
        isbn_value = form.cleaned_data.get('isbn')
        sku_value = form.cleaned_data.get('sku')
        # Update the related inventory
        Inventory.objects.update_or_create(
            book=self.object,
            defaults={
                'stock': stock_value,
                'isbn': isbn_value,
                'sku': sku_value
            }
        )
        return response


class BookDeleteView(DeleteView):
    model = Book
    success_url = reverse_lazy('inventory')

    def post(self, request, *args, **kwargs):
        book = self.get_object()
        messages.warning(request, f"Book '{book.title}' has been removed from inventory.")
        return super().post(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)

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
            'form': AddUserForm(),  # Add this line
        }
        return render(request, 'AdminPanel/users_roles.html', context)

class AddUserView(View):
    def get(self, request):
        form = AddUserForm()
        return render(request, 'AdminPanel/user_form.html', {'form': form})

    def post(self, request):
        form = AddUserForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, f"User {form.cleaned_data['username']} created successfully!")
            return redirect('roles')
        return render(request, 'AdminPanel/user_form.html', {'form': form})

class ToggleUserRoleView(View):
    def post(self, request, user_id):
        target_user = get_object_or_404(User, id=user_id)
        
        if target_user == request.user:
            messages.error(request, "You cannot change your own role to prevent lockout.")
        else:
            target_user.role = "admin" if target_user.role == "User" else "User"
            target_user.save()
            
            new_role = "admin" if target_user.role == "admin" else "User"
            messages.success(request, f"Updated {target_user.username} to {new_role}.")
            
        return redirect('roles')