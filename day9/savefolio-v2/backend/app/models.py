from sqlalchemy import Column, Date, Float, Integer, String, Text

from .database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(Date, nullable=False, index=True)
    note = Column(Text, nullable=True)