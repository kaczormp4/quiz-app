"""Change pricing to PLN.

Revision ID: 20260618_pricing_pln
Revises: 20260618_email_verification
Create Date: 2026-06-18
"""

from alembic import op


revision = "20260618_pricing_pln"
down_revision = "20260618_email_verification"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE plans
        SET price_amount = 0,
            currency = 'PLN'
        WHERE code = 'free'
        """
    )

    op.execute(
        """
        UPDATE plans
        SET price_amount = 5900,
            currency = 'PLN',
            description = 'One payment for 30 days of full Pro access. No subscription.'
        WHERE code = 'pro_30_days'
        """
    )

    op.execute(
        """
        UPDATE plans
        SET price_amount = 3900,
            currency = 'PLN',
            description = 'Monthly Pro subscription with premium access.'
        WHERE code = 'pro_monthly'
        """
    )

    op.execute(
        """
        UPDATE plans
        SET price_amount = 39900,
            currency = 'PLN',
            description = 'One yearly payment for full Pro access.'
        WHERE code = 'pro_yearly'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE plans
        SET price_amount = 0,
            currency = 'USD'
        WHERE code = 'free'
        """
    )

    op.execute(
        """
        UPDATE plans
        SET price_amount = 1499,
            currency = 'USD',
            description = 'One payment for 30 days of full Pro access. No subscription.'
        WHERE code = 'pro_30_days'
        """
    )

    op.execute(
        """
        UPDATE plans
        SET price_amount = 999,
            currency = 'USD',
            description = 'Monthly Pro subscription with premium access.'
        WHERE code = 'pro_monthly'
        """
    )

    op.execute(
        """
        UPDATE plans
        SET price_amount = 9900,
            currency = 'USD',
            description = 'One yearly payment for full Pro access.'
        WHERE code = 'pro_yearly'
        """
    )
