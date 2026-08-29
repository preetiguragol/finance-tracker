from django.db import models
from django.contrib.auth.models import User


class SalaryProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='salary_profile')
    monthly_salary = models.DecimalField(max_digits=10, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - ₹{self.monthly_salary}"