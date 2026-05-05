from django.urls import path
from . import views

urlpatterns = [
    # This makes the leaderboard available at the base of this app
    path('', views.community_view, name='community'),
    path('community', views.community_view, name='community'),
]