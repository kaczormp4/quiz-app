"""fix users created_at default

Revision ID: 20260617_users_created_at
Revises: 20260617_question_metadata
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260617_users_created_at"
down_revision: Union[str, None] = "20260617_question_metadata"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE users SET created_at = now() WHERE created_at IS NULL")
    op.execute("ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now()")


def downgrade() -> None:
    op.execute("ALTER TABLE users ALTER COLUMN created_at DROP DEFAULT")
