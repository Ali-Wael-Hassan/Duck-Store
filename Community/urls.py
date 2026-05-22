from django.urls import path
from .views import CommunityView

urlpatterns = [
    path('', CommunityView.as_view(), name='community'),
]