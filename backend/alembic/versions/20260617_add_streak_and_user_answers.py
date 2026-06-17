"""add streak and user answers

Revision ID: 20260617_streak_user_answers
Revises: 20260617_linkedin_wrong_answers
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_streak_user_answers"
down_revision: Union[str, None] = "20260617_linkedin_wrong_answers"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("current_streak", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("longest_streak", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("last_activity_date", sa.Date(), nullable=True),
    )

    op.create_table(
        "user_answers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("selected_answer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["selected_answer_id"], ["answers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(op.f("ix_user_answers_user_id"), "user_answers", ["user_id"], unique=False)
    op.create_index(op.f("ix_user_answers_question_id"), "user_answers", ["question_id"], unique=False)
    op.create_index(op.f("ix_user_answers_selected_answer_id"), "user_answers", ["selected_answer_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_answers_selected_answer_id"), table_name="user_answers")
    op.drop_index(op.f("ix_user_answers_question_id"), table_name="user_answers")
    op.drop_index(op.f("ix_user_answers_user_id"), table_name="user_answers")
    op.drop_table("user_answers")

    op.drop_column("users", "last_activity_date")
    op.drop_column("users", "longest_streak")
    op.drop_column("users", "current_streak")
