"""
URL configuration for Duck_Store_Project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
<<<<<<< HEAD:Duck_Store_Project/urls.py

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("Storefront.urls")),
    path("", include("UserAccount.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
=======
urlpatterns = [
    path('admin/', admin.site.urls), # updated to our admin
    path('auth/', include('Authentication.urls')),
    path('community/', include('Community.urls')),
    path('storefront/', include('Storefront.urls')),
    path('user/', include('UserAccount.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
>>>>>>> 4645f46133396f3d2ea401cb2065b287d2ade125:config/urls.py
