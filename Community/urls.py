from django.urls import path
from . import views

urlpatterns = [
    path('', views.community_view, name='community'),
    path('community', views.community_view, name='community'),
    path('search/', views.search_scholars, name='community_search'),
]