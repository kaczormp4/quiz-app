"""update pricing to usd and simplify plans

Revision ID: 20260617_update_pricing_to_usd
Revises: 20260617_billing_backend
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_update_pricing_to_usd"
down_revision: Union[str, None] = "20260617_billing_backend"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "plans",
        sa.Column(
            "features",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default="[]",
            nullable=False,
        ),
    )
    op.add_column(
        "plans",
        sa.Column("max_difficulty", sa.String(length=30), server_default="easy", nullable=False),
    )
    op.add_column(
        "plans",
        sa.Column("can_answer_questions", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "plans",
        sa.Column("can_view_explanations", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "plans",
        sa.Column("can_use_review", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "plans",
        sa.Column("can_submit_questions", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "plans",
        sa.Column("has_unlimited_questions", sa.Boolean(), server_default=sa.false(), nullable=False),
    )

    op.execute("""
        UPDATE plans
        SET
            name = 'Free',
            description = 'Read-only access to easy interview questions without explanations.',
            price_amount = 0,
            currency = 'USD',
            billing_period = 'forever',
            features = '[
                "Read-only access to questions",
                "Easy level only",
                "No explanations",
                "Basic browsing access"
            ]'::jsonb,
            max_difficulty = 'easy',
            can_answer_questions = false,
            can_view_explanations = false,
            can_use_review = false,
            can_submit_questions = false,
            has_unlimited_questions = false,
            is_active = true,
            sort_order = 1
        WHERE code = 'free';
    """)

    op.execute("""
        UPDATE plans
        SET
            name = 'Pro Monthly',
            description = 'Full access to DevPrep with explanations, review mode and all difficulty levels.',
            price_amount = 1000,
            currency = 'USD',
            billing_period = 'monthly',
            features = '[
                "Unlimited questions",
                "All difficulty levels",
                "Full explanations",
                "Review mode",
                "Answer history and progress tracking",
                "Community question submissions"
            ]'::jsonb,
            max_difficulty = 'hard',
            can_answer_questions = true,
            can_view_explanations = true,
            can_use_review = true,
            can_submit_questions = true,
            has_unlimited_questions = true,
            is_active = true,
            sort_order = 2
        WHERE code = 'pro_monthly';
    """)

    op.execute("""
        INSERT INTO plans (
            id,
            code,
            name,
            description,
            price_amount,
            currency,
            billing_period,
            features,
            max_difficulty,
            can_answer_questions,
            can_view_explanations,
            can_use_review,
            can_submit_questions,
            has_unlimited_questions,
            is_active,
            sort_order
        )
        VALUES (
            gen_random_uuid(),
            'pro_yearly',
            'Pro Yearly',
            'Full access to DevPrep for one year with a discounted yearly price.',
            10000,
            'USD',
            'yearly',
            '[
                "Unlimited questions",
                "All difficulty levels",
                "Full explanations",
                "Review mode",
                "Answer history and progress tracking",
                "Community question submissions",
                "Save $20 compared to monthly"
            ]'::jsonb,
            'hard',
            true,
            true,
            true,
            true,
            true,
            true,
            3
        )
        ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price_amount = EXCLUDED.price_amount,
            currency = EXCLUDED.currency,
            billing_period = EXCLUDED.billing_period,
            features = EXCLUDED.features,
            max_difficulty = EXCLUDED.max_difficulty,
            can_answer_questions = EXCLUDED.can_answer_questions,
            can_view_explanations = EXCLUDED.can_view_explanations,
            can_use_review = EXCLUDED.can_use_review,
            can_submit_questions = EXCLUDED.can_submit_questions,
            has_unlimited_questions = EXCLUDED.has_unlimited_questions,
            is_active = EXCLUDED.is_active,
            sort_order = EXCLUDED.sort_order;
    """)

    op.execute("""
        UPDATE plans
        SET is_active = false
        WHERE code IN ('interview_sprint', 'lifetime_early_access');
    """)


def downgrade() -> None:
    op.execute("DELETE FROM plans WHERE code = 'pro_yearly';")

    op.execute("""
        UPDATE plans
        SET is_active = true
        WHERE code IN ('interview_sprint', 'lifetime_early_access');
    """)

    op.drop_column("plans", "has_unlimited_questions")
    op.drop_column("plans", "can_submit_questions")
    op.drop_column("plans", "can_use_review")
    op.drop_column("plans", "can_view_explanations")
    op.drop_column("plans", "can_answer_questions")
    op.drop_column("plans", "max_difficulty")
    op.drop_column("plans", "features")
