from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from transactions.models import Transaction
from .models import SalaryProfile
from .serializers import SalaryProfileSerializer
import datetime


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def salary_profile(request):
    if request.method == 'GET':
        try:
            profile = SalaryProfile.objects.get(user=request.user)
            serializer = SalaryProfileSerializer(profile)
            return Response(serializer.data)
        except SalaryProfile.DoesNotExist:
            return Response({'monthly_salary': None})

    salary = request.data.get('monthly_salary')
    if not salary:
        return Response({'error': 'monthly_salary is required'}, status=status.HTTP_400_BAD_REQUEST)

    profile, created = SalaryProfile.objects.update_or_create(
        user=request.user,
        defaults={'monthly_salary': salary}
    )
    serializer = SalaryProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salary_split(request):
    month = request.query_params.get('month', datetime.date.today().month)
    year = request.query_params.get('year', datetime.date.today().year)

    try:
        profile = SalaryProfile.objects.get(user=request.user)
        salary = float(profile.monthly_salary)
    except SalaryProfile.DoesNotExist:
        return Response({'error': 'Salary not set'}, status=status.HTTP_404_NOT_FOUND)

    # 50/30/20 buckets
    needs_budget = salary * 0.50
    wants_budget = salary * 0.30
    savings_budget = salary * 0.20

    # needs categories
    needs_categories = ['Rent', 'Food', 'Healthcare', 'EMI']
    wants_categories = ['Shopping', 'Entertainment', 'Travel', 'Subscriptions']

    transactions = Transaction.objects.filter(
        user=request.user,
        transaction_type='expense',
        date__month=month,
        date__year=year
    )

    needs_spent = transactions.filter(
        category__name__in=needs_categories
    ).aggregate(total=Sum('amount'))['total'] or 0

    wants_spent = transactions.filter(
        category__name__in=wants_categories
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_spent = transactions.aggregate(
        total=Sum('amount'))['total'] or 0
    savings_spent = float(total_spent) - float(needs_spent) - float(wants_spent)

    return Response({
        'salary': salary,
        'month': month,
        'year': year,
        'needs': {
            'budget': needs_budget,
            'spent': float(needs_spent),
            'remaining': needs_budget - float(needs_spent)
        },
        'wants': {
            'budget': wants_budget,
            'spent': float(wants_spent),
            'remaining': wants_budget - float(wants_spent)
        },
        'savings': {
            'budget': savings_budget,
            'spent': max(0, savings_spent),
            'remaining': savings_budget - max(0, savings_spent)
        }
    })