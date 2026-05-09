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