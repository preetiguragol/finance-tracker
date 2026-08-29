from django.urls import path
from . import views

urlpatterns = [
    path('', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('summary/', views.monthly_summary, name='monthly-summary'),
    path('report/', views.monthly_report, name='monthly-report'),
]