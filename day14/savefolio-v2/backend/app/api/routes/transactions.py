from datetime import date
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_, select

from app.api.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionListResponse,
    TransactionRead,
    TransactionUpdate,
)


router = APIRouter()


def get_owned_transaction(
    transaction_id: int,
    user_id: int,
    database: DatabaseDependency,
) -> Transaction:
    transaction = database.scalar(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id,
        )
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    return transaction


@router.get(
    "/",
    response_model=TransactionListResponse,
)
def list_transactions(
    database: DatabaseDependency,
    current_user: CurrentUserDependency,
    search: str | None = Query(default=None, max_length=100),
    transaction_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    category: str | None = Query(default=None, max_length=80),
    date_from: date | None = None,
    date_to: date | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
) -> TransactionListResponse:
    conditions = [
        Transaction.user_id == current_user.id
    ]

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"

        conditions.append(
            or_(
                Transaction.title.ilike(search_pattern),
                Transaction.category.ilike(search_pattern),
                Transaction.notes.ilike(search_pattern),
            )
        )

    if transaction_type:
        conditions.append(
            Transaction.transaction_type == transaction_type
        )

    if category and category.strip():
        conditions.append(
            func.lower(Transaction.category)
            == category.strip().lower()
        )

    if date_from:
        conditions.append(
            Transaction.transaction_date >= date_from
        )

    if date_to:
        conditions.append(
            Transaction.transaction_date <= date_to
        )

    total = database.scalar(
        select(func.count(Transaction.id)).where(*conditions)
    ) or 0

    transactions = database.scalars(
        select(Transaction)
        .where(*conditions)
        .order_by(
            Transaction.transaction_date.desc(),
            Transaction.id.desc(),
        )
        .offset(skip)
        .limit(limit)
    ).all()

    return TransactionListResponse(
        items=list(transactions),
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    payload: TransactionCreate,
    database: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> Transaction:
    transaction = Transaction(
        user_id=current_user.id,
        **payload.model_dump(),
    )

    database.add(transaction)
    database.commit()
    database.refresh(transaction)

    return transaction


@router.get(
    "/{transaction_id}",
    response_model=TransactionRead,
)
def read_transaction(
    transaction_id: int,
    database: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> Transaction:
    return get_owned_transaction(
        transaction_id,
        current_user.id,
        database,
    )


@router.patch(
    "/{transaction_id}",
    response_model=TransactionRead,
)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    database: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> Transaction:
    transaction = get_owned_transaction(
        transaction_id,
        current_user.id,
        database,
    )

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if value is not None:
            setattr(transaction, field, value)

    database.commit()
    database.refresh(transaction)

    return transaction


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transaction(
    transaction_id: int,
    database: DatabaseDependency,
    current_user: CurrentUserDependency,
) -> None:
    transaction = get_owned_transaction(
        transaction_id,
        current_user.id,
        database,
    )

    database.delete(transaction)
    database.commit()