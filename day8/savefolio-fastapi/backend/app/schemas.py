from datetime import date as Date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TransactionType = Literal["income", "spend", "saving"]


class TransactionBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    transaction_type: TransactionType
    category: str | None = Field(default="", max_length=100)
    date: Date
    note: str | None = ""


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    amount: float | None = Field(default=None, gt=0)
    transaction_type: TransactionType | None = None
    category: str | None = Field(default=None, max_length=100)
    date: Date | None = None
    note: str | None = None


class TransactionResponse(TransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SavingsChartItem(BaseModel):
    month: str
    savings: float


class SummaryResponse(BaseModel):
    income: float
    spends: float
    savings: float
    balance: float
    savings_chart: list[SavingsChartItem]