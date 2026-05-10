<<<<<<< HEAD
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import GamificationConfig
from .forms import GamificationConfigForm

from django.views.generic import ListView, View
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from .models import DashboardStat, SalesPerformance
from Storefront.models import Book, Order

class GamificationAdminView(View):
    template_name = 'Gamification_Admin.html'

    # Helper method to get the config
    def getConfig(self):
        config, created = GamificationConfig.objects.get_or_create(pk=1)
        return config

    def get(self, request):
        config = self.getConfig()
        form = GamificationConfigForm(instance=config)
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        config = self.getConfig()

        # Handle Reset Logic
        if 'reset' in request.POST:
            config.delete()
            messages.info(request, "Configuration reset to default values.")
            return redirect('Gamification_Admin')

        # Handle Save Logic
        form = GamificationConfigForm(request.POST, instance=config)
        
        # TODO replace this is_valid with new validation logic
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration saved successfully!")
            return redirect('Gamification_Admin')
        
        # If form is invalid, re-render the page with errors
        return render(request, self.template_name, {'form': form})

class AdminDashboardView(ListView):
    template_name = "dashboard.html"
    context_object_name = "recent_orders"
    model = Order
    paginate_by = 5 # Each 5 transaction = 1 Page

    def get_queryset(self):
        return Order.objects.all().order_by('-date')

    def get_context_data(self, **kwargs):
        # TODO make it accepts both monthly and weekly dynamically
        context = super().get_context_data(**kwargs)
        
        context['stats'] = DashboardStat.objects.all().order_by('sort_order')
        
        context['sales_data'] = SalesPerformance.objects.filter(
            period_type='weekly'
        ).order_by('sort_order')
        
        
        context['trending_books'] = Book.objects.all().order_by('-sales')[:4]
        
        return context

class OrderDeleteView(View):
    
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        order.delete()
        return redirect('dashboard')
=======
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib import messages
from django.shortcuts import redirect
from .models import Book
from .forms import BookForm

class InventoryDashboardView(ListView):
    """
    Handles the main inventory table with pagination.
    Replaces: inventory_dashboard()
    """
    model = Book
    template_name = 'AdminPanel/Book-&-inventory.html'
    context_object_name = 'page_obj'  # Matches your current template variable
    paginate_by = 5
    ordering = ['-id']

class BookBaseView:
    """
    A Mixin to share common logic between Create and Update.
    Keeps code DRY (Don't Repeat Yourself).
    """
    model = Book
    form_class = BookForm
    template_name = 'AdminPanel/book_form.html'
    success_url = reverse_lazy('inventory_dashboard')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Check if we are updating or creating to set the heading
        context['is_edit'] = self.object is not None
        return context

class BookCreateView(BookBaseView, CreateView):
    """Handles adding a new book."""
    pass

class BookUpdateView(BookBaseView, UpdateView):
    """Handles editing an existing book."""
    pass

class BookDeleteView(DeleteView):
    """
    Handles book deletion. 
    Matches your requirement of only allowing POST for deletion.
    """
    model = Book
    success_url = reverse_lazy('inventory_dashboard')

    def post(self, request, *args, **kwargs):
        book = self.get_object()
        messages.warning(request, f"Book '{book.title}' has been removed from inventory.")
        return super().post(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """Redirects to dashboard if accessed via GET, preventing accidental deletes."""
        return redirect(self.success_url)
>>>>>>> be0a2b60eb63af18f99b35217a3412662200d247
