from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TransactionType = Literal["income", "expense"]


class TransactionCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    transaction_type: TransactionType
    category: str = Field(min_length=2, max_length=80)
    transaction_date: date
    notes: str | None = Field(default=None, max_length=500)


class TransactionUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    transaction_type: TransactionType | None = None
    category: str | None = Field(
        default=None,
        min_length=2,
        max_length=80,
    )
    transaction_date: date | None = None
    notes: str | None = Field(default=None, max_length=500)


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    amount: Decimal
    transaction_type: TransactionType
    category: str
    transaction_date: date
    notes: str | None
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    items: list[TransactionRead]
    total: int
    skip: int
    limit: int