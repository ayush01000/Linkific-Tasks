"""Add administrator and account-status fields.

Revision ID: 20260803_0002
Revises: 20260801_0001
Create Date: 2026-08-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260803_0002"
down_revision: str | None = "20260801_0001"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "is_admin",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.true(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_users_is_admin",
        "users",
        ["is_admin"],
    )
    op.create_index(
        "ix_users_is_active",
        "users",
        ["is_active"],
    )


def downgrade() -> None:
    op.drop_index("ix_users_is_active", table_name="users")
    op.drop_index("ix_users_is_admin", table_name="users")
    op.drop_column("users", "is_active")
    op.drop_column("users", "is_admin")
