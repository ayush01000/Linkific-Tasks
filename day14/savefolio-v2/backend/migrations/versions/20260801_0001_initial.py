"""Create users and transactions tables.

Revision ID: 20260801_0001
Revises:
Create Date: 2026-08-01
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260801_0001"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column(
            "hashed_password",
            sa.String(255),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_index(
        "ix_users_id",
        "users",
        ["id"],
    )

    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column(
            "amount",
            sa.Numeric(12, 2),
            nullable=False,
        ),
        sa.Column(
            "transaction_type",
            sa.String(20),
            nullable=False,
        ),
        sa.Column(
            "category",
            sa.String(80),
            nullable=False,
        ),
        sa.Column(
            "transaction_date",
            sa.Date(),
            nullable=False,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "amount > 0",
            name="ck_transactions_positive_amount",
        ),
        sa.CheckConstraint(
            "transaction_type IN ('income', 'expense')",
            name="ck_transactions_valid_type",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_transactions_id",
        "transactions",
        ["id"],
    )

    op.create_index(
        "ix_transactions_user_id",
        "transactions",
        ["user_id"],
    )

    op.create_index(
        "ix_transactions_transaction_type",
        "transactions",
        ["transaction_type"],
    )

    op.create_index(
        "ix_transactions_category",
        "transactions",
        ["category"],
    )

    op.create_index(
        "ix_transactions_transaction_date",
        "transactions",
        ["transaction_date"],
    )


def downgrade() -> None:
    op.drop_table("transactions")
    op.drop_table("users")