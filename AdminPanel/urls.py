from django.urls import path
from . import views

urlpatterns = [
    # This matches the link in your sidebar: <a href="Gamification_Admen.html">
    path('gamification-admin/', views.gamification_admin_view, name='Gamification_Admin'),
]