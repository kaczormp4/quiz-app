"""add contribution points and question author

Revision ID: 20260617_contribution_points
Revises: 20260617_user_generated_questions
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_contribution_points"
down_revision: Union[str, None] = "20260617_user_generated_questions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("contribution_points", sa.Integer(), server_default="0", nullable=False),
    )

    op.add_column(
        "questions",
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
    )

    op.create_foreign_key(
        "fk_questions_created_by_user_id_users",
        "questions",
        "users",
        ["created_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index(
        op.f("ix_questions_created_by_user_id"),
        "questions",
        ["created_by_user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_questions_created_by_user_id"), table_name="questions")
    op.drop_constraint("fk_questions_created_by_user_id_users", "questions", type_="foreignkey")
    op.drop_column("questions", "created_by_user_id")
    op.drop_column("users", "contribution_points")
