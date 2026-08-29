from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.salary_profile, name='salary-profile'),
    path('split/', views.salary_split, name='salary-split'),
]