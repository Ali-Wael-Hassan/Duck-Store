from django.shortcuts import render, redirect, get_object_or_404
from django.core.paginator import Paginator
from django.contrib import messages
from .models import Book
from .forms import BookForm

def inventory_dashboard(request):
    """
    Main Inventory Table View.
    Replaces InventoryController.renderInventory()
    """
    # Get all books, newest first
    book_list = Book.objects.all().order_by('-id')
    
    # Pagination: 5 books per page
    paginator = Paginator(book_list, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'AdminPanel/Book-&-inventory.html', {
        'page_obj': page_obj
    })

def manage_book(request, pk=None):
    # If pk is provided, we are editing; otherwise, adding
    book = get_object_or_404(Book, pk=pk) if pk else None
    
    if request.method == 'POST':
        # Replaces manual data collection from JS modal
        form = BookForm(request.POST, request.FILES, instance=book)
        if form.is_valid():
            form.save() # Automatic ISBN/SKU generation happens in models.py
            return redirect('inventory_dashboard')
    else:
        # GET request: Show the form
        form = BookForm(instance=book)
    
    return render(request, 'AdminPanel/book_form.html', {
        'form': form,
        'is_edit': bool(pk)
    })
def delete_book(request, pk):
    """
    Delete View.
    Replaces deleteBook(id) from JS
    """
    book = get_object_or_404(Book, pk=pk)
    title = book.title
    
    # We use a POST check for safety to prevent accidental deletions via GET
    if request.method == 'POST':
        book.delete()
        messages.warning(request, f"Book '{title}' has been removed from inventory.")
        return redirect('inventory_dashboard')
    
    # If someone tries to access via GET, just show them the dashboard
    return redirect('inventory_dashboard')