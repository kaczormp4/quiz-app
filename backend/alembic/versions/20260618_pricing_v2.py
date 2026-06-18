"""pricing v2 noop

Revision ID: 20260618_pricing_v2
Revises: 20260618_fair_pricing
Create Date: 2026-06-18
"""

from typing import Sequence, Union


revision: str = "20260618_pricing_v2"
down_revision: Union[str, None] = "20260618_fair_pricing"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
