"""add question metadata

Revision ID: 20260617_question_metadata
Revises: 20260617_update_pricing_to_usd
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_question_metadata"
down_revision: Union[str, None] = "20260617_update_pricing_to_usd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("questions", sa.Column("created_by_username", sa.String(length=100), nullable=True))
    op.add_column("questions", sa.Column("approved_by_user_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("questions", sa.Column("approved_by_username", sa.String(length=100), nullable=True))
    op.add_column("questions", sa.Column("views_count", sa.Integer(), server_default="0", nullable=False))

    op.create_foreign_key(
        "fk_questions_approved_by_user_id_users",
        "questions",
        "users",
        ["approved_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index(
        op.f("ix_questions_approved_by_user_id"),
        "questions",
        ["approved_by_user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_questions_approved_by_user_id"), table_name="questions")
    op.drop_constraint("fk_questions_approved_by_user_id_users", "questions", type_="foreignkey")
    op.drop_column("questions", "views_count")
    op.drop_column("questions", "approved_by_username")
    op.drop_column("questions", "approved_by_user_id")
    op.drop_column("questions", "created_by_username")
