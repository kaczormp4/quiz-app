"""add user generated categories and pending questions

Revision ID: 20260617_user_questions
Revises: 20260617_streak_user_answers
Create Date: 2026-06-17
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_user_questions"
down_revision: Union[str, None] = "20260617_streak_user_answers"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(length=20), server_default="user", nullable=False))
    op.add_column("users", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("github_url", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("website_url", sa.String(length=500), nullable=True))

    op.add_column(
        "categories",
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_categories_created_by_user_id_users",
        "categories",
        "users",
        ["created_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(op.f("ix_categories_created_by_user_id"), "categories", ["created_by_user_id"], unique=False)

    op.create_table(
        "pending_questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("submitted_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reviewed_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("difficulty", sa.String(length=30), nullable=False),
        sa.Column("explanation_html", sa.Text(), nullable=False),
        sa.Column("points", sa.Integer(), server_default="1", nullable=False),
        sa.Column("status", sa.String(length=30), server_default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["submitted_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_pending_questions_category_id"), "pending_questions", ["category_id"], unique=False)
    op.create_index(op.f("ix_pending_questions_submitted_by_user_id"), "pending_questions", ["submitted_by_user_id"], unique=False)
    op.create_index(op.f("ix_pending_questions_reviewed_by_user_id"), "pending_questions", ["reviewed_by_user_id"], unique=False)

    op.create_table(
        "pending_answers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pending_question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["pending_question_id"], ["pending_questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_pending_answers_pending_question_id"), "pending_answers", ["pending_question_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_pending_answers_pending_question_id"), table_name="pending_answers")
    op.drop_table("pending_answers")

    op.drop_index(op.f("ix_pending_questions_reviewed_by_user_id"), table_name="pending_questions")
    op.drop_index(op.f("ix_pending_questions_submitted_by_user_id"), table_name="pending_questions")
    op.drop_index(op.f("ix_pending_questions_category_id"), table_name="pending_questions")
    op.drop_table("pending_questions")

    op.drop_index(op.f("ix_categories_created_by_user_id"), table_name="categories")
    op.drop_constraint("fk_categories_created_by_user_id_users", "categories", type_="foreignkey")
    op.drop_column("categories", "created_by_user_id")

    op.drop_column("users", "website_url")
    op.drop_column("users", "github_url")
    op.drop_column("users", "bio")
    op.drop_column("users", "role")
