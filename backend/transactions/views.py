from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer
import datetime


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)

        # filters
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        transaction_type = self.request.query_params.get('type')
        category = self.request.query_params.get('category')

        if month and year:
            queryset = queryset.filter(date__month=month, date__year=year)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if category:
            queryset = queryset.filter(category_id=category)

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
    month = request.query_params.get('month', datetime.date.today().month)
    year = request.query_params.get('year', datetime.date.today().year)

    transactions = Transaction.objects.filter(
        user=request.user,
        date__month=month,
        date__year=year
    )

    total_income = transactions.filter(
        transaction_type='income'
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_expense = transactions.filter(
        transaction_type='expense'
    ).aggregate(total=Sum('amount'))['total'] or 0

    net_savings = total_income - total_expense

    return Response({
        'month': month,
        'year': year,
        'total_income': total_income,
        'total_expense': total_expense,
        'net_savings': net_savings
    })