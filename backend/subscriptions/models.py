from django.db import models
from django.contrib.auth.models import User


class Subscription(models.Model):
    BILLING_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=10, choices=BILLING_CYCLE_CHOICES, default='monthly')
    renewal_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['renewal_date']

    def __str__(self):
        return f"{self.user.username} - {self.name}"

    @property
    def days_until_renewal(self):
        from datetime import date
        return (self.renewal_date - date.today()).days

    @property
    def is_due_soon(self):
        return 0 <= self.days_until_renewal <= 7