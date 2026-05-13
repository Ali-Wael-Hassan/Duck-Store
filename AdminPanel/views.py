from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views import View
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Sum, Q, Count
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth

import csv
from .models import GamificationConfig, DashboardStat, SalesPerformance
from .forms import AddUserForm, GamificationConfigForm, BookForm, FeaturedPromoForm, CuratedConfigForm
from Storefront.models import Inventory, Order, Book, Genre, FeaturedPromo, CuratedConfig

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

        completed = Order.objects.filter(status__iexact='completed')

        total_revenue = completed.aggregate(s=Sum('total'))['s'] or 0
        total_orders = completed.count()
        total_users = User.objects.count()
        total_books = Book.objects.count()

        context['stats'] = [
            {'label': 'Total Revenue', 'value': f'{total_revenue:.0f}', 'subtext': f'{total_orders} orders'},
            {'label': 'Total Orders', 'value': str(total_orders), 'subtext': 'All time'},
            {'label': 'Active Users', 'value': str(total_users), 'subtext': 'Registered'},
            {'label': 'Total Books', 'value': str(total_books), 'subtext': 'In catalog'},
        ]

        period = self.request.GET.get('period', 'weekly').lower()
        if period not in ['weekly', 'monthly']:
            period = 'weekly'
        context['current_period'] = period

        trunc_fn = TruncWeek if period == 'weekly' else TruncMonth
        sales_qs = (
            completed
            .annotate(period_label=trunc_fn('date'))
            .values('period_label')
            .annotate(total=Sum('total'))
            .order_by('period_label')
        )
        max_total = max((s['total'] for s in sales_qs), default=0)
        context['sales_data'] = [
            {
                'label': s['period_label'].strftime('%m/%d') if s['period_label'] else 'N/A',
                'fill_height': int((s['total'] / max_total) * 100) if max_total else 0,
            }
            for s in sales_qs
        ]

        context['trending_books'] = Book.objects.all().order_by('-sales')[:4]

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
        context['genres'] = Genre.objects.all().order_by('name')
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

class FeaturedPromoListView(ListView):
    model = FeaturedPromo
    template_name = 'AdminPanel/featuredpromo_list.html'
    context_object_name = 'promos'


class FeaturedPromoCreateView(CreateView):
    model = FeaturedPromo
    form_class = FeaturedPromoForm
    template_name = 'AdminPanel/featuredpromo_form.html'
    success_url = reverse_lazy('list_featured_promos')


class FeaturedPromoUpdateView(UpdateView):
    model = FeaturedPromo
    form_class = FeaturedPromoForm
    template_name = 'AdminPanel/featuredpromo_form.html'
    success_url = reverse_lazy('list_featured_promos')


class FeaturedPromoDeleteView(View):
    def post(self, request, pk):
        promo = get_object_or_404(FeaturedPromo, pk=pk)
        promo.delete()
        messages.success(request, "Featured promotion deleted.")
        return redirect('list_featured_promos')


class CuratedConfigListView(ListView):
    model = CuratedConfig
    template_name = 'AdminPanel/curatedconfig_list.html'
    context_object_name = 'configs'


class CuratedConfigCreateView(CreateView):
    model = CuratedConfig
    form_class = CuratedConfigForm
    template_name = 'AdminPanel/curatedconfig_form.html'
    success_url = reverse_lazy('list_curated_configs')


class CuratedConfigUpdateView(UpdateView):
    model = CuratedConfig
    form_class = CuratedConfigForm
    template_name = 'AdminPanel/curatedconfig_form.html'
    success_url = reverse_lazy('list_curated_configs')


class CuratedConfigDeleteView(View):
    def post(self, request, pk):
        config = get_object_or_404(CuratedConfig, pk=pk)
        config.delete()
        messages.success(request, "Curated configuration deleted.")
        return redirect('list_curated_configs')


class UsersRolesIndexView(View):
    def get(self, request):
        role_filter = request.GET.get('role', 'all').lower()
        search_query = request.GET.get('search', '')

        user_list = User.objects.all().order_by('-date_joined')

        if role_filter == 'admin':
            user_list = user_list.filter(role='admin')
        elif role_filter == 'user':
            user_list = user_list.filter(role='user')

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
            target_user.role = "admin" if target_user.role == "user" else "user"
            target_user.save()
            
            new_role = "admin" if target_user.role == "admin" else "user"
            messages.success(request, f"Updated {target_user.username} to {new_role}.")
            
        return redirect('roles')