from calendar import month_abbr
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api",
    tags=["Transactions"],
)


def find_transaction(transaction_id: int, db: Session):
    transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return transaction


@router.get(
    "/transactions/",
    response_model=list[schemas.TransactionResponse],
)
def get_transactions(db: Session = Depends(get_db)):
    return (
        db.query(models.Transaction)
        .order_by(
            models.Transaction.date.desc(),
            models.Transaction.id.desc(),
        )
        .all()
    )


@router.get(
    "/transactions/{transaction_id}/",
    response_model=schemas.TransactionResponse,
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    return find_transaction(transaction_id, db)


@router.post(
    "/transactions/",
    response_model=schemas.TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    transaction_data: schemas.TransactionCreate,
    db: Session = Depends(get_db),
):
    transaction = models.Transaction(
        **transaction_data.model_dump(),
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.put(
    "/transactions/{transaction_id}/",
    response_model=schemas.TransactionResponse,
)
def replace_transaction(
    transaction_id: int,
    transaction_data: schemas.TransactionCreate,
    db: Session = Depends(get_db),
):
    transaction = find_transaction(transaction_id, db)

    for field, value in transaction_data.model_dump().items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    return transaction


@router.patch(
    "/transactions/{transaction_id}/",
    response_model=schemas.TransactionResponse,
)
def update_transaction(
    transaction_id: int,
    transaction_data: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
):
    transaction = find_transaction(transaction_id, db)

    changes = transaction_data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete(
    "/transactions/{transaction_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = find_transaction(transaction_id, db)

    db.delete(transaction)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/summary/",
    response_model=schemas.SummaryResponse,
)
def get_summary(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()

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

    balance = income - spends - savings

    monthly_savings = defaultdict(float)

    for transaction in transactions:
        if transaction.transaction_type == "saving":
            month_key = (
                transaction.date.year,
                transaction.date.month,
            )
            monthly_savings[month_key] += transaction.amount

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
        "balance": balance,
        "savings_chart": savings_chart,
    }