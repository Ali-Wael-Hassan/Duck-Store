from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.views.generic import DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Book, UserBook, Review

class BookDetailView(DetailView):
    """
    Handles displaying the book details, ownership status, and reviews.
    Replaces: book_detail_view()
    """
    model = Book
    template_name = 'Storefront/book-view.html'
    context_object_name = 'book'
    pk_url_kwarg = 'book_id'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        book = self.object
        request = self.request

        # Logic for Ownership Status
        is_owned = False
        is_borrowed = False
        if request.user.is_authenticated:
            user_entry = UserBook.objects.filter(user=request.user, book=book).first()
            if user_entry:
                is_owned = user_entry.ownership_type == 'owned'
                is_borrowed = user_entry.ownership_type == 'borrowed'

        # Synopsis "Read More" logic
        limit = 150
        desc = book.description
        has_more = len(desc) > limit
        
        context.update({
            'is_owned': is_owned,
            'is_borrowed': is_borrowed,
            'main_desc': desc[:limit] if has_more else desc,
            'extra_desc': desc[limit:] if has_more else "",
            'has_more': has_more,
            'star_range': range(1, 6),
            'show_review_form': request.GET.get('show_form') == 'true'
        })
        return context

class AddReviewView(LoginRequiredMixin, View):
    """
    Handles creating a new book review.
    Replaces: add_review()
    """
    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
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
        return redirect('book_detail', book_id=book_id)

class BookActionView(LoginRequiredMixin, View):
    """
    Handles Buy/Borrow logic.
    Replaces: handle_book_action()
    """
    def post(self, request, book_id, action_type):
        book = get_object_or_404(Book, id=book_id)
        UserBook.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={'ownership_type': action_type}
        )
        return redirect('book_detail', book_id=book_id)