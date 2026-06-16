import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.quizzes.models import Category, Question
from app.quizzes.schemas import (
    CategoryResponse,
    QuestionDetailsResponse,
    QuestionListItemResponse,
)


router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category)
        .where(Category.is_active.is_(True))
        .order_by(Category.created_at.asc())
    )

    return result.scalars().all()


@router.get(
    "/categories/{slug}/questions",
    response_model=list[QuestionListItemResponse],
)
async def get_category_questions(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    category_result = await db.execute(
        select(Category).where(
            Category.slug == slug,
            Category.is_active.is_(True),
        )
    )
    category = category_result.scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    questions_result = await db.execute(
        select(Question)
        .where(
            Question.category_id == category.id,
            Question.is_active.is_(True),
        )
        .order_by(Question.created_at.asc())
    )

    return questions_result.scalars().all()


@router.get(
    "/questions/{question_id}",
    response_model=QuestionDetailsResponse,
)
async def get_question(
    question_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Question)
        .options(selectinload(Question.answers))
        .where(
            Question.id == question_id,
            Question.is_active.is_(True),
        )
    )

    question = result.scalar_one_or_none()

    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    question.answers.sort(key=lambda answer: answer.position)

    return question