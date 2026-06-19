from __future__ import annotations

import os

import random
import re
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.quizzes.models import Answer, Category, PendingAnswer, PendingQuestion, Question
from app.domains.quizzes.schemas import (
    AdminImportQuestionRequest,
    AnswerPublic,
    CategoryCreateRequest,
    CategoryPublic,
    PendingAnswerPublic,
    PendingQuestionCreateRequest,
    PendingQuestionPublic,
    QuestionPublic,
    QuestionSummaryPublic,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
from app.domains.users.models import User
from app.domains.users.routes import get_current_user

router = APIRouter(prefix="/quizzes", tags=["quizzes"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9ąćęłńóśźż]+", "-", value)
    value = value.strip("-")

    return value or "category"


async def create_unique_slug(db: AsyncSession, name: str) -> str:
    base_slug = slugify(name)
    slug = base_slug
    counter = 2

    while True:
        result = await db.execute(select(Category).where(Category.slug == slug))
        existing_category = result.scalars().first()

        if existing_category is None:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


async def serialize_question(
    question: Question,
    db: AsyncSession,
) -> QuestionPublic:
    answers_result = await db.execute(
        select(Answer)
        .where(Answer.question_id == question.id)
        .order_by(Answer.position.asc())
    )
    answers = answers_result.scalars().all()
    random.shuffle(answers)

    return QuestionPublic(
        id=question.id,
        category_id=question.category_id,
        question=question.question,
        difficulty=question.difficulty,
        explanation_html=question.explanation_html,
        points=question.points,
        answers=[
            AnswerPublic(
                id=answer.id,
                text=answer.text,
                position=index,
            )
            for index, answer in enumerate(answers, start=1)
        ],
        created_by_username=question.created_by_username,
        approved_by_username=question.approved_by_username,
        views_count=question.views_count,
    )


async def serialize_pending_question(
    pending_question: PendingQuestion,
    db: AsyncSession,
) -> PendingQuestionPublic:
    category = await db.get(Category, pending_question.category_id)

    submitted_by_username = None
    reviewed_by_username = None

    if pending_question.submitted_by_user_id:
        submitted_by_user = await db.get(User, pending_question.submitted_by_user_id)
        submitted_by_username = submitted_by_user.username if submitted_by_user else None

    if pending_question.reviewed_by_user_id:
        reviewed_by_user = await db.get(User, pending_question.reviewed_by_user_id)
        reviewed_by_username = reviewed_by_user.username if reviewed_by_user else None

    answers_result = await db.execute(
        select(PendingAnswer)
        .where(PendingAnswer.pending_question_id == pending_question.id)
        .order_by(PendingAnswer.position.asc())
    )
    answers = answers_result.scalars().all()

    return PendingQuestionPublic(
        id=pending_question.id,
        category_id=pending_question.category_id,
        category_name=category.name if category else "Unknown",
        submitted_by_user_id=pending_question.submitted_by_user_id,
        submitted_by_username=submitted_by_username,
        reviewed_by_user_id=pending_question.reviewed_by_user_id,
        reviewed_by_username=reviewed_by_username,
        question=pending_question.question,
        difficulty=pending_question.difficulty,
        explanation_html=pending_question.explanation_html,
        points=pending_question.points,
        status=pending_question.status,
        created_at=pending_question.created_at,
        reviewed_at=pending_question.reviewed_at,
        answers=[
            PendingAnswerPublic(
                id=answer.id,
                text=answer.text,
                explanation_html=answer.explanation_html,
                is_correct=answer.is_correct,
                position=answer.position,
            )
            for answer in answers
        ],
    )


@router.get("/categories", response_model=list[CategoryPublic])
async def get_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryPublic]:
    result = await db.execute(
        select(Category)
        .where(Category.is_active.is_(True))
        .order_by(Category.name.asc())
    )

    return list(result.scalars().all())


@router.post("/categories", response_model=CategoryPublic, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CategoryPublic:
    slug = await create_unique_slug(db, payload.name)

    category = Category(
        slug=slug,
        name=payload.name,
        description=payload.description,
        created_by_user_id=current_user.id,
    )

    db.add(category)

    await db.commit()
    await db.refresh(category)

    return category


@router.get("/categories/{slug}/questions", response_model=list[QuestionSummaryPublic])
async def get_category_questions(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> list[QuestionSummaryPublic]:
    category_result = await db.execute(
        select(Category).where(Category.slug == slug)
    )
    category = category_result.scalars().first()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    questions_result = await db.execute(
        select(Question)
        .where(Question.category_id == category.id)
        .order_by(Question.created_at.asc())
    )
    questions = questions_result.scalars().all()

    return [
        QuestionSummaryPublic(
            id=question.id,
            category_id=question.category_id,
            question=question.question,
            difficulty=question.difficulty,
            points=question.points,
            created_by_username=question.created_by_username,
            approved_by_username=question.approved_by_username,
            views_count=question.views_count,
        )
        for question in questions
    ]


@router.get("/questions/{question_id}", response_model=QuestionPublic)
async def get_question(
    question_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> QuestionPublic:
    question = await db.get(Question, question_id)

    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    question.views_count = (question.views_count or 0) + 1

    await db.commit()
    await db.refresh(question)

    return await serialize_question(question, db)


@router.post("/questions/{question_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    question_id: UUID,
    payload: SubmitAnswerRequest,
    db: AsyncSession = Depends(get_db),
) -> SubmitAnswerResponse:
    question = await db.get(Question, question_id)

    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    selected_answer = await db.get(Answer, payload.answer_id)

    if selected_answer is None or selected_answer.question_id != question.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid answer",
        )

    correct_answer_result = await db.execute(
        select(Answer).where(
            Answer.question_id == question.id,
            Answer.is_correct.is_(True),
        )
    )
    correct_answer = correct_answer_result.scalars().first()

    if correct_answer is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Correct answer not configured",
        )

    return SubmitAnswerResponse(
        is_correct=selected_answer.id == correct_answer.id,
        correct_answer=AnswerPublic(
            id=correct_answer.id,
            text=correct_answer.text,
            position=correct_answer.position,
        ),
        explanation_html=question.explanation_html,
    )


@router.post(
    "/categories/{category_id}/pending-questions",
    response_model=PendingQuestionPublic,
    status_code=status.HTTP_201_CREATED,
)
async def submit_pending_question(
    category_id: UUID,
    payload: PendingQuestionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PendingQuestionPublic:
    category = await db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    pending_question = PendingQuestion(
        category_id=category.id,
        submitted_by_user_id=current_user.id,
        question=payload.question,
        difficulty=payload.difficulty,
        explanation_html=payload.explanation_html,
        points=payload.points,
        status="pending",
    )

    db.add(pending_question)
    await db.flush()

    for answer in payload.answers:
        db.add(
            PendingAnswer(
                pending_question_id=pending_question.id,
                text=answer.text,
                explanation_html=answer.explanation_html,
                is_correct=answer.is_correct,
                position=answer.position,
            )
        )

    await db.commit()
    await db.refresh(pending_question)

    return await serialize_pending_question(pending_question, db)


@router.get("/my/pending-questions", response_model=list[PendingQuestionPublic])
async def get_my_pending_questions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PendingQuestionPublic]:
    result = await db.execute(
        select(PendingQuestion)
        .where(PendingQuestion.submitted_by_user_id == current_user.id)
        .order_by(PendingQuestion.created_at.desc())
    )
    pending_questions = result.scalars().all()

    return [
        await serialize_pending_question(pending_question, db)
        for pending_question in pending_questions
    ]



@admin_router.post(
    "/import-payload",
    response_model=PendingQuestionPublic,
    status_code=status.HTTP_201_CREATED,
)
async def import_admin_question_payload(
    payload: AdminImportQuestionRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PendingQuestionPublic:
    category_slug = slugify(payload.category_code)

    category_result = await db.execute(
        select(Category).where(Category.slug == category_slug)
    )
    category = category_result.scalars().first()

    if category is None:
        category = Category(
            slug=category_slug,
            name=payload.category_code.replace("_", " ").replace("-", " ").title(),
            description=None,
            is_active=True,
            created_by_user_id=current_user.id,
        )
        db.add(category)
        await db.flush()

    correct_answer = next(answer for answer in payload.answers if answer.is_correct)

    pending_question = PendingQuestion(
        category_id=category.id,
        submitted_by_user_id=current_user.id,
        question=payload.question,
        difficulty=payload.difficulty,
        explanation_html=correct_answer.explanation_html,
        points=payload.points,
        status="pending",
    )

    db.add(pending_question)
    await db.flush()

    answer_position_by_id = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
    }

    used_positions = set()

    for index, answer in enumerate(payload.answers, start=1):
        position = answer_position_by_id.get(str(answer.id), index)

        if position in used_positions:
            position = index

        used_positions.add(position)

        db.add(
            PendingAnswer(
                pending_question_id=pending_question.id,
                text=answer.text,
                explanation_html=answer.explanation_html,
                is_correct=answer.is_correct,
                position=position,
            )
        )

    await db.commit()
    await db.refresh(pending_question)

    return await serialize_pending_question(pending_question, db)




@admin_router.delete("/quiz-data")
async def clear_quiz_data(
    confirm: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if os.getenv("ENABLE_ADMIN_DANGER_ACTIONS") != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Danger admin actions are disabled.",
        )

    if confirm != "YES_DELETE_QUIZZES_AND_CATEGORIES":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation value.",
        )

    tables = [
        "pending_answers",
        "pending_questions",
        "answers",
        "questions",
        "categories",
    ]

    before = {}

    for table_name in tables:
        result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        before[table_name] = int(result.scalar_one())

    await db.execute(
        text(
            """
            TRUNCATE TABLE
                pending_answers,
                pending_questions,
                answers,
                questions,
                categories
            RESTART IDENTITY CASCADE
            """
        )
    )

    await db.commit()

    return {
        "message": "Quiz data and categories deleted.",
        "deleted": before,
    }



@admin_router.get("/pending-questions", response_model=list[PendingQuestionPublic])
async def get_admin_pending_questions(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[PendingQuestionPublic]:
    result = await db.execute(
        select(PendingQuestion)
        .where(PendingQuestion.status == "pending")
        .order_by(PendingQuestion.created_at.asc())
    )
    pending_questions = result.scalars().all()

    return [
        await serialize_pending_question(pending_question, db)
        for pending_question in pending_questions
    ]


@admin_router.post("/pending-questions/{pending_question_id}/approve", response_model=PendingQuestionPublic)
async def approve_pending_question(
    pending_question_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PendingQuestionPublic:
    pending_question = await db.get(PendingQuestion, pending_question_id)

    if pending_question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending question not found",
        )

    if pending_question.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question has already been reviewed",
        )

    contributor = None

    if pending_question.submitted_by_user_id is not None:
        contributor = await db.get(User, pending_question.submitted_by_user_id)

    question = Question(
        category_id=pending_question.category_id,
        question=pending_question.question,
        difficulty=pending_question.difficulty,
        explanation_html=pending_question.explanation_html,
        points=pending_question.points,
        created_by_user_id=pending_question.submitted_by_user_id,
        created_by_username=contributor.username if contributor else None,
        approved_by_user_id=current_user.id,
        approved_by_username=current_user.username,
        views_count=0,
    )

    db.add(question)
    await db.flush()

    pending_answers_result = await db.execute(
        select(PendingAnswer)
        .where(PendingAnswer.pending_question_id == pending_question.id)
        .order_by(PendingAnswer.position.asc())
    )
    pending_answers = pending_answers_result.scalars().all()

    for pending_answer in pending_answers:
        db.add(
            Answer(
                question_id=question.id,
                text=pending_answer.text,
                explanation_html=pending_answer.explanation_html,
                is_correct=pending_answer.is_correct,
                position=pending_answer.position,
            )
        )

    pending_question.status = "accepted"
    pending_question.reviewed_by_user_id = current_user.id
    pending_question.reviewed_at = datetime.now(timezone.utc)

    if contributor is not None:
        contributor.contribution_points += pending_question.points
        contributor.points += pending_question.points

    await db.commit()
    await db.refresh(pending_question)

    return await serialize_pending_question(pending_question, db)


@admin_router.post("/pending-questions/{pending_question_id}/reject", response_model=PendingQuestionPublic)
async def reject_pending_question(
    pending_question_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PendingQuestionPublic:
    pending_question = await db.get(PendingQuestion, pending_question_id)

    if pending_question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending question not found",
        )

    if pending_question.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question has already been reviewed",
        )

    pending_question.status = "rejected"
    pending_question.reviewed_by_user_id = current_user.id
    pending_question.reviewed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(pending_question)

    return await serialize_pending_question(pending_question, db)
