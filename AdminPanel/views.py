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