"""update fair pricing

Revision ID: 20260618_fair_pricing
Revises: 20260617_users_created_at
Create Date: 2026-06-18
"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260618_fair_pricing"
down_revision: Union[str, None] = "20260617_users_created_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO plans (
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
        VALUES
        (
            'free',
            'Free',
            'Start learning for free with easy questions and community submissions.',
            0,
            'USD',
            'forever',
            '[
                "Easy level questions",
                "Correct answer for easy questions",
                "Community question submissions",
                "No explanations",
                "No review mode",
                "No answer history"
            ]'::jsonb,
            'easy',
            false,
            false,
            false,
            true,
            false,
            true,
            1
        ),
        (
            'pro_monthly',
            'Pro Monthly',
            'Flexible monthly access for short-term interview preparation.',
            1499,
            'USD',
            'monthly',
            '[
                "Unlimited questions",
                "All difficulty levels",
                "Full explanations",
                "Review mode",
                "Answer history and progress tracking",
                "Community question submissions",
                "Cancel anytime"
            ]'::jsonb,
            'hard',
            true,
            true,
            true,
            true,
            true,
            true,
            2
        ),
        (
            'pro_yearly',
            'Pro Annual',
            'Best value ? billed yearly. Equivalent to $8.33/month.',
            9999,
            'USD',
            'yearly',
            '[
                "Unlimited questions",
                "All difficulty levels",
                "Full explanations",
                "Review mode",
                "Answer history and progress tracking",
                "Community question submissions",
                "Equivalent to $8.33/month",
                "Save 44% compared to monthly"
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
            sort_order = EXCLUDED.sort_order
    """)

    op.execute("""
        UPDATE plans
        SET is_active = false
        WHERE code IN ('interview_sprint', 'lifetime_early_access')
    """)


def downgrade() -> None:
    op.execute("""
        UPDATE plans
        SET
            price_amount = 1000,
            billing_period = 'monthly',
            description = 'Full access to interview preparation features.'
        WHERE code = 'pro_monthly'
    """)

    op.execute("""
        UPDATE plans
        SET
            price_amount = 10000,
            billing_period = 'yearly',
            description = 'Full access billed yearly.'
        WHERE code = 'pro_yearly'
    """)
