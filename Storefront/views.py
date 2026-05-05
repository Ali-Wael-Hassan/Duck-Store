from django.shortcuts import render
from .models import Book, FeaturedPromo, CuratedConfig, Genre

def home_view(request):
    """
    Logic for the Home Page. 
    Fetches featured promos, top sales (trending), and curated recommendations.
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
    return render(request, 'Storefront/home.html', context)

def catalog_view(request):
    """
    View for the 'Store' page (Catalog). 
    Displays all books and genres for filtering.
    """
    books = Book.objects.all()
    genres = Genre.objects.all()
    
    context = {
        'books': books,
        'genres': genres,
    }
    return render(request, 'Storefront/store.html', context)
