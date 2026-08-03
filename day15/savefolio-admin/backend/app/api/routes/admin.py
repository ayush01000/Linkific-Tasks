from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import case, func, or_, select

from app.api.dependencies import (
    CurrentAdminDependency,
    DatabaseDependency,
)
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.admin import (
    AdminOverviewResponse,
    AdminTransactionListResponse,
    AdminTransactionRead,
    AdminUserListResponse,
    AdminUserRead,
    AdminUserUpdate,
)


router = APIRouter()


@router.get(
    "/overview",
    response_model=AdminOverviewResponse,
)
def get_admin_overview(
    database: DatabaseDependency,
    current_admin: CurrentAdminDependency,
) -> AdminOverviewResponse:
    user_count = database.scalar(
        select(func.count(User.id))
    ) or 0
    active_user_count = database.scalar(
        select(func.count(User.id)).where(
            User.is_active.is_(True)
        )
    ) or 0
    admin_count = database.scalar(
        select(func.count(User.id)).where(
            User.is_admin.is_(True)
        )
    ) or 0

    transaction_row = database.execute(
        select(
            func.count(Transaction.id),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type == "income",
                            Transaction.amount,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type == "expense",
                            Transaction.amount,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
        )
    ).one()

    transaction_count, total_income, total_expenses = (
        transaction_row
    )

    income = Decimal(total_income)
    expenses = Decimal(total_expenses)

    return AdminOverviewResponse(
        user_count=user_count,
        active_user_count=active_user_count,
        admin_count=admin_count,
        transaction_count=transaction_count,
        total_income=income,
        total_expenses=expenses,
        net_flow=income - expenses,
    )


@router.get(
    "/users",
    response_model=AdminUserListResponse,
)
def list_users(
    database: DatabaseDependency,
    current_admin: CurrentAdminDependency,
    search: str | None = Query(default=None, max_length=100),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
) -> AdminUserListResponse:
    conditions = []

    if search and search.strip():
        pattern = f"%{search.strip()}%"
        conditions.append(
            or_(
                User.name.ilike(pattern),
                User.email.ilike(pattern),
            )
        )

    total = database.scalar(
        select(func.count(User.id)).where(*conditions)
    ) or 0

    transaction_counts = (
        select(
            Transaction.user_id.label("user_id"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .group_by(Transaction.user_id)
        .subquery()
    )

    rows = database.execute(
        select(
            User,
            func.coalesce(
                transaction_counts.c.transaction_count,
                0,
            ),
        )
        .outerjoin(
            transaction_counts,
            transaction_counts.c.user_id == User.id,
        )
        .where(*conditions)
        .order_by(User.created_at.desc(), User.id.desc())
        .offset(skip)
        .limit(limit)
    ).all()

    items = [
        AdminUserRead(
            id=user.id,
            name=user.name,
            email=user.email,
            is_admin=user.is_admin,
            is_active=user.is_active,
            created_at=user.created_at,
            transaction_count=transaction_count,
        )
        for user, transaction_count in rows
    ]

    return AdminUserListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.patch(
    "/users/{user_id}",
    response_model=AdminUserRead,
)
def update_user_access(
    user_id: int,
    payload: AdminUserUpdate,
    database: DatabaseDependency,
    current_admin: CurrentAdminDependency,
) -> AdminUserRead:
    user = database.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    changes = payload.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one access setting is required.",
        )

    if user.id == current_admin.id and (
        changes.get("is_admin") is False
        or changes.get("is_active") is False
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You cannot remove your own administrator access.",
        )

    for field, value in changes.items():
        setattr(user, field, value)

    database.commit()
    database.refresh(user)

    transaction_count = database.scalar(
        select(func.count(Transaction.id)).where(
            Transaction.user_id == user.id
        )
    ) or 0

    return AdminUserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        is_admin=user.is_admin,
        is_active=user.is_active,
        created_at=user.created_at,
        transaction_count=transaction_count,
    )


@router.get(
    "/transactions",
    response_model=AdminTransactionListResponse,
)
def list_all_transactions(
    database: DatabaseDependency,
    current_admin: CurrentAdminDependency,
    search: str | None = Query(default=None, max_length=100),
    transaction_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    user_id: int | None = Query(default=None, ge=1),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
) -> AdminTransactionListResponse:
    conditions = []

    if search and search.strip():
        pattern = f"%{search.strip()}%"
        conditions.append(
            or_(
                Transaction.title.ilike(pattern),
                Transaction.category.ilike(pattern),
                User.name.ilike(pattern),
                User.email.ilike(pattern),
            )
        )

    if transaction_type:
        conditions.append(
            Transaction.transaction_type == transaction_type
        )

    if user_id:
        conditions.append(Transaction.user_id == user_id)

    total = database.scalar(
        select(func.count(Transaction.id))
        .join(User, User.id == Transaction.user_id)
        .where(*conditions)
    ) or 0

    rows = database.execute(
        select(Transaction, User)
        .join(User, User.id == Transaction.user_id)
        .where(*conditions)
        .order_by(
            Transaction.transaction_date.desc(),
            Transaction.id.desc(),
        )
        .offset(skip)
        .limit(limit)
    ).all()

    items = [
        AdminTransactionRead(
            id=transaction.id,
            user_id=user.id,
            user_name=user.name,
            user_email=user.email,
            title=transaction.title,
            amount=transaction.amount,
            transaction_type=transaction.transaction_type,
            category=transaction.category,
            transaction_date=transaction.transaction_date,
            notes=transaction.notes,
            created_at=transaction.created_at,
            updated_at=transaction.updated_at,
        )
        for transaction, user in rows
    ]

    return AdminTransactionListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.delete(
    "/transactions/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_any_transaction(
    transaction_id: int,
    database: DatabaseDependency,
    current_admin: CurrentAdminDependency,
) -> None:
    transaction = database.get(Transaction, transaction_id)

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    database.delete(transaction)
    database.commit()
