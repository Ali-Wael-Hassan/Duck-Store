from django.shortcuts import render, redirect
from django.contrib import messages
from .models import GamificationConfig
from .forms import GamificationConfigForm

from django.views.generic import ListView, View
from django.shortcuts import get_object_of_404
from django.db.models import Sum
from .models import DashboardStat, SalesPerformance
from Storefront.models import Book, Order

def gamification_admin_view(request):
    # gets the single config object or creates it
    config, created = GamificationConfig.objects.get_or_create(pk=1)

    if request.method == 'POST':
        # deletes current record so next load uses model defaults
        if 'reset' in request.POST:
            config.delete()
            messages.info(request, "Configuration reset to default values.")
            return redirect('Gamification_Admin')

        # updates the database with form data
        form = GamificationConfigForm(request.POST, instance=config)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration saved successfully!")
            return redirect('Gamification_Admin')
    else:
        form = GamificationConfigForm(instance=config)

    return render(request, 'AdminPanel/Gamification_Admin.html', {'form': form})

class AdminDashboardView(ListView):
    template_name = "dashboard.html"
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
        
        context['trending_books'] = Book.objects.all().order_by('-sales')[:4]
        
        return context

class OrderDeleteView(View):
    def post(self, request, order_id):
        order = get_object_of_404(Order, id=order_id)
        order.delete()
        return redirect('dashboard')