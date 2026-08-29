from rest_framework import serializers
from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    days_until_renewal = serializers.ReadOnlyField()
    is_due_soon = serializers.ReadOnlyField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'name', 'amount', 'billing_cycle',
            'renewal_date', 'notes', 'days_until_renewal',
            'is_due_soon', 'created_at'
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)