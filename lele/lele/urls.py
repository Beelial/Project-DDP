"""
URL configuration for lele project.

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
from django.urls import path,include
from django.views.generic import RedirectView
from hello.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('home/', home, name='home'),
    path('', RedirectView.as_view(url='/home/', permanent=False)),
    path('tentang/', tentang, name='tentang'),
    path('produk/', produk, name='produk'),
    path('login/', login_view, name='login'),
    path('register/', register, name='register'),
    path('logout/', logout_view, name='logout'),
    path('profile/', edit_profile_view, name='edit_profile'),
    path('payment/', process_payment, name='process_payment'),
    path('payment_history/', payment_history, name='payment_history'),
    path('payment/result/<int:order_id>/', payment_result, name='payment_result'),
    path('api/cart/', cart_list),
    path('api/cart/add/', cart_add),
    path('api/cart/update/', cart_update),
]
