from django.shortcuts import render, redirect
from django.contrib import messages
from .models import GamificationConfig, Order, Book, Stat
from .forms import GamificationConfigForm

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

def dashboard_view(request):
    # Fetch data from Database
    orders_list = Order.objects.all().order_by('-date')
    trending_books = Book.objects.all().order_by('-sales')[:4]
    stats = Stat.objects.all() # Or aggregate from Order model
    
    # Simple Pagination for the initial load
    rows_per_page = 5
    recent_transactions = orders_list[:rows_per_page]
    
    context = {
        'orders': orders_list,
        'recent_transactions': recent_transactions,
        'trending_books': trending_books,
        'stats': stats,
        'total_orders': orders_list.count(),
        'rows_per_page': rows_per_page,
    }
    return render(request, 'AdminPanel/Dashboard.html', context)