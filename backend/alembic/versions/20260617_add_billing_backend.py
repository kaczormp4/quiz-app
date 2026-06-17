"""add billing backend

Revision ID: 20260617_billing_backend
Revises: 20260617_contribution_points
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_billing_backend"
down_revision: Union[str, None] = "20260617_contribution_points"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


plans_table = sa.table(
    "plans",
    sa.column("id", postgresql.UUID(as_uuid=True)),
    sa.column("code", sa.String()),
    sa.column("name", sa.String()),
    sa.column("description", sa.Text()),
    sa.column("price_amount", sa.Integer()),
    sa.column("currency", sa.String()),
    sa.column("billing_period", sa.String()),
    sa.column("is_active", sa.Boolean()),
    sa.column("sort_order", sa.Integer()),
)


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_pro", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("subscription_expires_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price_amount", sa.Integer(), server_default="0", nullable=False),
        sa.Column("currency", sa.String(length=10), server_default="PLN", nullable=False),
        sa.Column("billing_period", sa.String(length=30), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_plans_code"), "plans", ["code"], unique=True)

    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=30), server_default="pending", nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_subscriptions_plan_id"), "subscriptions", ["plan_id"], unique=False)
    op.create_index(op.f("ix_subscriptions_user_id"), "subscriptions", ["user_id"], unique=False)

    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("subscription_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("provider", sa.String(length=50), server_default="manual", nullable=False),
        sa.Column("provider_payment_id", sa.String(length=255), nullable=True),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=10), server_default="PLN", nullable=False),
        sa.Column("status", sa.String(length=30), server_default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["subscription_id"], ["subscriptions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payments_plan_id"), "payments", ["plan_id"], unique=False)
    op.create_index(op.f("ix_payments_subscription_id"), "payments", ["subscription_id"], unique=False)
    op.create_index(op.f("ix_payments_user_id"), "payments", ["user_id"], unique=False)

    op.bulk_insert(
        plans_table,
        [
            {
                "id": "80b83cce-5577-4997-b377-e8e335354ad8",
                "code": "free",
                "name": "Free",
                "description": "Basic access for trying DevPrep.",
                "price_amount": 0,
                "currency": "PLN",
                "billing_period": "forever",
                "is_active": True,
                "sort_order": 1,
            },
            {
                "id": "2b6e1ac3-cfe9-4b95-8424-d998fad78988",
                "code": "pro_monthly",
                "name": "Pro",
                "description": "Unlimited practice and advanced interview preparation.",
                "price_amount": 2900,
                "currency": "PLN",
                "billing_period": "monthly",
                "is_active": True,
                "sort_order": 2,
            },
            {
                "id": "d6a1c907-3723-425b-89d9-302ef7b0e4ae",
                "code": "interview_sprint",
                "name": "Interview Sprint",
                "description": "Focused 30-day interview preparation.",
                "price_amount": 7900,
                "currency": "PLN",
                "billing_period": "30_days",
                "is_active": True,
                "sort_order": 3,
            },
            {
                "id": "e9d7bfe7-1f75-49d4-aefe-322e79a2860d",
                "code": "lifetime_early_access",
                "name": "Lifetime Early Access",
                "description": "One-time early supporter plan.",
                "price_amount": 19900,
                "currency": "PLN",
                "billing_period": "lifetime",
                "is_active": True,
                "sort_order": 4,
            },
        ],
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_payments_user_id"), table_name="payments")
    op.drop_index(op.f("ix_payments_subscription_id"), table_name="payments")
    op.drop_index(op.f("ix_payments_plan_id"), table_name="payments")
    op.drop_table("payments")

    op.drop_index(op.f("ix_subscriptions_user_id"), table_name="subscriptions")
    op.drop_index(op.f("ix_subscriptions_plan_id"), table_name="subscriptions")
    op.drop_table("subscriptions")

    op.drop_index(op.f("ix_plans_code"), table_name="plans")
    op.drop_table("plans")

    op.drop_column("users", "subscription_expires_at")
    op.drop_column("users", "is_pro")
