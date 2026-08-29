from django.urls import path
from . import views

urlpatterns = [
    path('', views.SubscriptionListCreateView.as_view(), name='subscription-list'),
    path('<int:pk>/', views.SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('due-soon/', views.due_soon, name='due-soon'),
]