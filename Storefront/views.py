from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Book, UserBook

def book_detail_view(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    
    # Check if user already owns/borrows the book
    is_owned = False
    is_borrowed = False
    if request.user.is_authenticated:
        user_entry = UserBook.objects.filter(user=request.user, book=book).first()
        if user_entry:
            is_owned = user_entry.ownership_type == 'owned'
            is_borrowed = user_entry.ownership_type == 'borrowed'

    # Description "Read More" logic
    limit = 150
    has_more = len(book.description) > limit
    main_desc = book.description[:limit] if has_more else book.description
    extra_desc = book.description[limit:] if has_more else ""

    context = {
        'book': book,
        'is_owned': is_owned,
        'is_borrowed': is_borrowed,
        'main_desc': main_desc,
        'extra_desc': extra_desc,
        'has_more': has_more,
        'star_range': range(1, 6), # To loop 5 times for stars
    }
    return render(request, 'Storefront/book-view.html', context)

@login_required
def add_review(request, book_id):
    if request.method == 'POST':
        book = get_object_or_404(Book, id=book_id)
        
        # Get data from the form
        rating_value = request.POST.get('rating')
        comment_text = request.POST.get('comment')

        if rating_value and comment_text:
            Review.objects.create(
                user=request.user,
                book=book,
                user_name=request.user.username,
                rating=int(rating_value),
                comment=comment_text
            )
        
        # This sends you back to the book page
        return redirect('book_detail', book_id=book_id)
    
    return redirect('book_detail', book_id=book_id)

@login_required
def handle_book_action(request, book_id, action_type):
    book = get_object_or_404(Book, id=book_id)
    # This saves the record to your account
    UserBook.objects.get_or_create(
        user=request.user,
        book=book,
        defaults={'ownership_type': action_type}
    )
    # This sends you back to the page so the button updates to "IN LIBRARY"
    return redirect('book_detail', book_id=book_id)