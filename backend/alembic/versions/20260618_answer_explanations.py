"""Add explanation_html to answers.

Revision ID: 20260618_answer_explanations
Revises: 20260618_pricing_pln
Create Date: 2026-06-18
"""

from alembic import op
import sqlalchemy as sa


revision = "20260618_answer_explanations"
down_revision = "20260618_pricing_pln"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "answers",
        sa.Column(
            "explanation_html",
            sa.Text(),
            nullable=False,
            server_default="",
        ),
    )

    op.execute(
        """
        UPDATE answers AS a
        SET explanation_html = COALESCE(q.explanation_html, '')
        FROM questions AS q
        WHERE a.question_id = q.id
          AND a.is_correct = true
          AND a.explanation_html = ''
        """
    )

    op.alter_column(
        "answers",
        "explanation_html",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("answers", "explanation_html")
