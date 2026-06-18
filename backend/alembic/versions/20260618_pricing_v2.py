"""pricing v2 with one month pass and annual commitment

Revision ID: 20260618_pricing_v2
Revises: 20260618_fair_pricing
Create Date: 2026-06-18
"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260618_pricing_v2"
down_revision: Union[str, None] = "20260618_fair_pricing"
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
            'pro_30_days',
            '30-Day Pass',
            'One payment for 30 days of full Pro access. No subscription.',
            1499,
            'USD',
            'one_time_30_days',
            '[
                "30 days of Pro access",
                "One payment",
                "No subscription",
                "All difficulty levels",
                "Full explanations",
                "Review mode",
                "Answer history"
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
            'pro_monthly',
            'Monthly Subscription',
            'Pay monthly with a minimum 12-month commitment.',
            999,
            'USD',
            'monthly_min_12',
            '[
                "$9.99/month",
                "Minimum 12-month commitment",
                "Billed monthly",
                "All difficulty levels",
                "Full explanations",
                "Review mode",
                "Answer history",
                "Community question submissions"
            ]'::jsonb,
            'hard',
            true,
            true,
            true,
            true,
            true,
            true,
            3
        ),
        (
            'pro_yearly',
            'Annual Upfront',
            'Pay upfront for one year. Best value.',
            9900,
            'USD',
            'yearly_upfront',
            '[
                "$99 paid upfront",
                "One year of Pro access",
                "Equivalent to $8.25/month",
                "Save $20.88 vs monthly subscription",
                "All difficulty levels",
                "Full explanations",
                "Review mode",
                "Answer history",
                "Community question submissions"
            ]'::jsonb,
            'hard',
            true,
            true,
            true,
            true,
            true,
            true,
            4
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
    op.execute("UPDATE plans SET is_active = false WHERE code = 'pro_30_days'")

    op.execute("""
        UPDATE plans
        SET
            name = 'Pro Monthly',
            description = 'Flexible monthly access for short-term interview preparation.',
            price_amount = 1499,
            billing_period = 'monthly',
            sort_order = 2
        WHERE code = 'pro_monthly'
    """)

    op.execute("""
        UPDATE plans
        SET
            name = 'Pro Annual',
            description = 'Best value ? billed yearly.',
            price_amount = 9999,
            billing_period = 'yearly',
            sort_order = 3
        WHERE code = 'pro_yearly'
    """)
