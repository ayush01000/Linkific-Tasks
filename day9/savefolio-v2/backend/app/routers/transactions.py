from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"],
)


def find_transaction(transaction_id: int, database: Session):
    transaction = (
        database.query(models.Transaction)
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
    "/",
    response_model=list[schemas.TransactionResponse],
)
def list_transactions(database: Session = Depends(get_db)):
    return (
        database.query(models.Transaction)
        .order_by(
            models.Transaction.date.desc(),
            models.Transaction.id.desc(),
        )
        .all()
    )


@router.post(
    "/",
    response_model=schemas.TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    transaction_data: schemas.TransactionCreate,
    database: Session = Depends(get_db),
):
    transaction = models.Transaction(
        **transaction_data.model_dump(),
    )

    database.add(transaction)
    database.commit()
    database.refresh(transaction)

    return transaction


@router.patch(
    "/{transaction_id}/",
    response_model=schemas.TransactionResponse,
)
def update_transaction(
    transaction_id: int,
    transaction_data: schemas.TransactionUpdate,
    database: Session = Depends(get_db),
):
    transaction = find_transaction(
        transaction_id,
        database,
    )

    changes = transaction_data.model_dump(
        exclude_unset=True,
    )

    for field, value in changes.items():
        setattr(transaction, field, value)

    database.commit()
    database.refresh(transaction)

    return transaction


@router.delete(
    "/{transaction_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transaction(
    transaction_id: int,
    database: Session = Depends(get_db),
):
    transaction = find_transaction(
        transaction_id,
        database,
    )

    database.delete(transaction)
    database.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)