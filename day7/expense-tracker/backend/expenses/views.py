from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        transaction_type = self.request.query_params.get("type")
        if transaction_type:
            queryset = queryset.filter(
                transaction_type=transaction_type
            )

        return queryset


@api_view(["GET"])
def dashboard_summary(request):
    totals = Transaction.objects.values(
        "transaction_type"
    ).annotate(total=Sum("amount"))

    total_map = {
        item["transaction_type"]: item["total"]
        for item in totals
    }

    income = total_map.get("income", Decimal("0"))
    spends = total_map.get("spend", Decimal("0"))
    savings = total_map.get("saving", Decimal("0"))
    balance = income - spends - savings

    monthly_savings = (
        Transaction.objects
        .filter(transaction_type="saving")
        .annotate(month=TruncMonth("date"))
        .values("month")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )

    chart = [
        {
            "month": item["month"].strftime("%b %Y"),
            "savings": item["total"],
        }
        for item in monthly_savings
    ]

    return Response({
        "income": income,
        "spends": spends,
        "savings": savings,
        "balance": balance,
        "savings_chart": chart,
    })