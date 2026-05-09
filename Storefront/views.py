from django.views import View
from django.shortcuts import render
from .models import Book, FeaturedPromo, CuratedConfig, Genre
from django.views.generic import ListView
class HomeView(View):
    template_name = 'Storefront/home.html'

    def get(self, request, *args, **kwargs):
        """
        Fetches featured promos, trending books, and curated recommendations.
        """
        featured_promos = FeaturedPromo.objects.filter(is_active=True)
        trending_books = Book.objects.order_by('-sales')[:7]
        
        curated_setup = CuratedConfig.objects.first()
        curated_books = []
        if curated_setup:
            curated_books = Book.objects.filter(
                genre=curated_setup.display_genre
            )[:curated_setup.limit]

        context = {
            'featured_promos': featured_promos,
            'trending_books': trending_books,
            'curated_books': curated_books,
            'curated_config': curated_setup,
        }
        return render(request, self.template_name, context)
class CatalogView(ListView):
    model = Book
    template_name = 'Storefront/store.html'
    context_object_name = 'page_obj'  # Keeping this name so your HTML doesn't change
    paginate_by = 12

    def get_queryset(self):
        """
        Handles filtering by category, price range, and sorting.
        """
        queryset = Book.objects.all()
        
        # Get Filter Params
        category = self.request.GET.get('category')
        sort_by = self.request.GET.get('sort', 'popularity')
        min_price = self.request.GET.get('minPrice')
        max_price = self.request.GET.get('maxPrice')

        # Filter by Category
        if category and category.strip():
            queryset = queryset.filter(genre__name__iexact=category)

        # Filter by Price Range
        try:
            if min_price and min_price.strip():
                queryset = queryset.filter(price__gte=float(min_price))
            if max_price and max_price.strip():
                queryset = queryset.filter(price__lte=float(max_price))
        except ValueError:
            pass 

        # Sorting Logic
        sort_mapping = {
            'price-low': 'price',
            'price-high': '-price',
            'title': 'title',
            'popularity': '-sales'
        }
        
        order_field = sort_mapping.get(sort_by, '-sales')
        return queryset.order_by(order_field)

    def get_context_data(self, **kwargs):
        """
        Adds extra context like genres and the current sort state.
        """
        context = super().get_context_data(**kwargs)
        context['genres'] = Genre.objects.all()
        context['current_sort'] = self.request.GET.get('sort', 'popularity')
        return context