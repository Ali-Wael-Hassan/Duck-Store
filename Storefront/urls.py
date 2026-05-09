from django.urls import path
from .views import HomeView, CatalogView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('store/', CatalogView.as_view(), name='store'),
]