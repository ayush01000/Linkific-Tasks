from calendar import month_abbr
from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api",
    tags=["Dashboard"],
)


@router.get(
    "/summary/",
    response_model=schemas.SummaryResponse,
)
def get_summary(database: Session = Depends(get_db)):
    transactions = database.query(
        models.Transaction
    ).all()

    income = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "income"
    )

    spends = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "spend"
    )

    savings = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "saving"
    )

    monthly_savings = defaultdict(float)

    for transaction in transactions:
        if transaction.transaction_type != "saving":
            continue

        key = (
            transaction.date.year,
            transaction.date.month,
        )

        monthly_savings[key] += transaction.amount

    savings_chart = [
        {
            "month": (
                f"{month_abbr[month]} "
                f"{str(year)[-2:]}"
            ),
            "savings": amount,
        }
        for (year, month), amount in sorted(
            monthly_savings.items()
        )
    ]

    return {
        "income": income,
        "spends": spends,
        "savings": savings,
        "balance": income - spends - savings,
        "savings_chart": savings_chart,
    }