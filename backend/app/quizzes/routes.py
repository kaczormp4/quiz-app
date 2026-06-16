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
    SubmitAnswerRequest,
    SubmitAnswerResponse,
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

@router.post(
    "/questions/{question_id}/answer",
    response_model=SubmitAnswerResponse,
)
async def submit_question_answer(
    question_id: uuid.UUID,
    payload: SubmitAnswerRequest,
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

    selected_answer = next(
        (
            answer
            for answer in question.answers
            if answer.id == payload.answer_id
        ),
        None,
    )

    if selected_answer is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer does not belong to this question",
        )

    correct_answer = next(
        (
            answer
            for answer in question.answers
            if answer.is_correct
        ),
        None,
    )

    if correct_answer is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Question has no correct answer configured",
        )

    return {
        "is_correct": selected_answer.is_correct,
        "correct_answer": {
            "id": correct_answer.id,
            "text": correct_answer.text,
        },
        "explanation_html": question.explanation_html,
    }