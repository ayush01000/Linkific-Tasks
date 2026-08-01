from datetime import date
from decimal import Decimal

from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.models.transaction import Transaction
from app.schemas.dashboard import DashboardResponse


router = APIRouter()


def get_month_key(months_ago: int) -> tuple[int, int]:
    today = date.today()
    total_months = (
        today.year * 12
        + today.month
        - 1
        - months_ago
    )

    return total_months // 12, total_months % 12 + 1


@router.get(
    "/",
    response_model=DashboardResponse,
)
def get_dashboard(
    database: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> dict:
    totals_query = (
        select(
            Transaction.transaction_type,
            func.sum(Transaction.amount),
        )
        .where(Transaction.user_id == current_user.id)
        .group_by(Transaction.transaction_type)
    )

    total_rows = database.execute(totals_query).all()

    totals = {
        "income": Decimal("0.00"),
        "expense": Decimal("0.00"),
    }

    for transaction_type, amount in total_rows:
        totals[transaction_type] = amount or Decimal("0.00")

    balance = totals["income"] - totals["expense"]
    savings = max(balance, Decimal("0.00"))

    month_keys = [
        get_month_key(months_ago)
        for months_ago in range(5, -1, -1)
    ]

    first_year, first_month = month_keys[0]
    first_date = date(first_year, first_month, 1)

    monthly_transactions = database.scalars(
        select(Transaction).where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= first_date,
        )
    ).all()

    monthly_totals = {
        month_key: {
            "income": Decimal("0.00"),
            "expenses": Decimal("0.00"),
        }
        for month_key in month_keys
    }

    for transaction in monthly_transactions:
        key = (
            transaction.transaction_date.year,
            transaction.transaction_date.month,
        )

        if key not in monthly_totals:
            continue

        if transaction.transaction_type == "income":
            monthly_totals[key]["income"] += transaction.amount
        else:
            monthly_totals[key]["expenses"] += transaction.amount

    monthly_data = []

    for year, month in month_keys:
        month_date = date(year, month, 1)

        monthly_data.append(
            {
                "label": month_date.strftime("%b %Y"),
                "income": monthly_totals[(year, month)]["income"],
                "expenses": monthly_totals[(year, month)]["expenses"],
            }
        )

    recent_transactions = database.scalars(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(
            Transaction.transaction_date.desc(),
            Transaction.id.desc(),
        )
        .limit(5)
    ).all()

    return {
        "totals": {
            "balance": balance,
            "income": totals["income"],
            "expenses": totals["expense"],
            "savings": savings,
        },
        "monthly_data": monthly_data,
        "recent_transactions": list(recent_transactions),
    }