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

from django.core.paginator import Paginator

def catalog_view(request):
    book_list = Book.objects.all()
    genres = Genre.objects.all()

    category = request.GET.get('category')
    sort_by = request.GET.get('sort', 'popularity')
    min_price = request.GET.get('minPrice')
    max_price = request.GET.get('maxPrice')

    if category and category.strip():
        book_list = book_list.filter(genre__name__iexact=category)

    if min_price and min_price.strip():
        try:
            book_list = book_list.filter(price__gte=float(min_price))
        except ValueError:
            pass 

    if max_price and max_price.strip():
        try:
            book_list = book_list.filter(price__lte=float(max_price))
        except ValueError:
            pass 

    if sort_by == 'price-low':
        book_list = book_list.order_by('price')
    elif sort_by == 'price-high':
        book_list = book_list.order_by('-price')
    elif sort_by == 'title':
        book_list = book_list.order_by('title')
    else:
        book_list = book_list.order_by('-sales') 

    paginator = Paginator(book_list, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'genres': genres,
        'current_sort': sort_by,
    }
    return render(request, 'Storefront/store.html', context)