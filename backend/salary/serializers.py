from rest_framework import serializers
from .models import SalaryProfile


class SalaryProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryProfile
        fields = ['id', 'monthly_salary', 'updated_at']
        read_only_fields = ['updated_at']