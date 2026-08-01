from decimal import Decimal

from pydantic import BaseModel

from app.schemas.transaction import TransactionRead


class DashboardTotals(BaseModel):
    balance: Decimal
    income: Decimal
    expenses: Decimal
    savings: Decimal


class MonthlyDataPoint(BaseModel):
    label: str
    income: Decimal
    expenses: Decimal


class DashboardResponse(BaseModel):
    totals: DashboardTotals
    monthly_data: list[MonthlyDataPoint]
    recent_transactions: list[TransactionRead]