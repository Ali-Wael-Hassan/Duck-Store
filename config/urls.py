from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('AdminPanel/', include('AdminPanel.urls')),
    path('admin/', admin.site.urls),
    path('auth/', include('Authentication.urls')),
    path('community/', include('Community.urls')),
    path('storefront/', include('Storefront.urls')),
    path('user/', include('UserAccount.urls')),
]