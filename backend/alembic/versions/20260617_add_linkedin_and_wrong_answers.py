"""add linkedin url and wrong answers

Revision ID: 20260617_linkedin_wrong_answers
Revises: 4a6a1e902a43
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_linkedin_wrong_answers"
down_revision: Union[str, None] = "4a6a1e902a43"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("linkedin_url", sa.String(length=500), nullable=True),
    )

    op.create_table(
        "wrong_answers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "question_id", name="uq_wrong_answers_user_question"),
    )

    op.create_index(
        op.f("ix_wrong_answers_user_id"),
        "wrong_answers",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_wrong_answers_question_id"),
        "wrong_answers",
        ["question_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_wrong_answers_question_id"), table_name="wrong_answers")
    op.drop_index(op.f("ix_wrong_answers_user_id"), table_name="wrong_answers")
    op.drop_table("wrong_answers")
    op.drop_column("users", "linkedin_url")
