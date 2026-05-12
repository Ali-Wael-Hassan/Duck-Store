from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('store/', include('Storefront.urls')),
    path('community/', include('Community.urls')),
    path('user/', include('UserAccount.urls')),
    path('admin-panel/', include('AdminPanel.urls')),
    path('admin/', admin.site.urls),
    path('', include('Authentication.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
