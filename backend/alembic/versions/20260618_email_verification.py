"""add email verification

Revision ID: 20260618_email_verification
Revises: 20260618_pricing_v2
Create Date: 2026-06-18
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260618_email_verification"
down_revision: Union[str, None] = "20260618_pricing_v2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "is_email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    op.add_column(
        "users",
        sa.Column("email_verification_token_hash", sa.String(length=128), nullable=True),
    )

    op.add_column(
        "users",
        sa.Column("email_verification_sent_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.add_column(
        "users",
        sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_index(
        op.f("ix_users_email_verification_token_hash"),
        "users",
        ["email_verification_token_hash"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_users_email_verification_token_hash"), table_name="users")
    op.drop_column("users", "email_verified_at")
    op.drop_column("users", "email_verification_sent_at")
    op.drop_column("users", "email_verification_token_hash")
    op.drop_column("users", "is_email_verified")
