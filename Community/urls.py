from django.urls import path
from .views import CommunityView, ScholarSearchView

urlpatterns = [
    path('', CommunityView.as_view(), name='community'),
    path('search/', ScholarSearchView.as_view(), name='community_search'),
]