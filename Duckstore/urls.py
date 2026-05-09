from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # This prefix "admin-panel/" determines the start of your browser URL
    path('admin-panel/', include('AdminPanel.urls')), 
    path('inventory/', include('AdminPanel.urls')),
]

# This is mandatory for your book images to show up!
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)