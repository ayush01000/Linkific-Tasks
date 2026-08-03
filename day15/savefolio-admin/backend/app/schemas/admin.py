from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr

from app.schemas.transaction import TransactionType


class AdminOverviewResponse(BaseModel):
    user_count: int
    active_user_count: int
    admin_count: int
    transaction_count: int
    total_income: Decimal
    total_expenses: Decimal
    net_flow: Decimal


class AdminUserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool
    is_active: bool
    created_at: datetime
    transaction_count: int


class AdminUserListResponse(BaseModel):
    items: list[AdminUserRead]
    total: int
    skip: int
    limit: int


class AdminUserUpdate(BaseModel):
    is_admin: bool | None = None
    is_active: bool | None = None


class AdminTransactionRead(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: EmailStr
    title: str
    amount: Decimal
    transaction_type: TransactionType
    category: str
    transaction_date: date
    notes: str | None
    created_at: datetime
    updated_at: datetime


class AdminTransactionListResponse(BaseModel):
    items: list[AdminTransactionRead]
    total: int
    skip: int
    limit: int
