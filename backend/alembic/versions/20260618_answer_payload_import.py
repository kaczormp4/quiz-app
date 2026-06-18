"""Add answer explanations and admin payload import support.

Revision ID: 20260618_answer_payload_import
Revises: 20260618_answer_explanations
Create Date: 2026-06-18
"""

from alembic import op


revision = "20260618_answer_payload_import"
down_revision = "20260618_answer_explanations"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE answers ADD COLUMN IF NOT EXISTS explanation_html TEXT NOT NULL DEFAULT ''"
    )

    op.execute(
        "ALTER TABLE pending_answers ADD COLUMN IF NOT EXISTS explanation_html TEXT NOT NULL DEFAULT ''"
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

    op.execute(
        """
        UPDATE pending_answers AS a
        SET explanation_html = COALESCE(q.explanation_html, '')
        FROM pending_questions AS q
        WHERE a.pending_question_id = q.id
          AND a.is_correct = true
          AND a.explanation_html = ''
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE pending_answers DROP COLUMN IF EXISTS explanation_html")
    op.execute("ALTER TABLE answers DROP COLUMN IF EXISTS explanation_html")
