from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/transactions/', include('transactions.urls')), 
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/salary/', include('salary.urls')),
]