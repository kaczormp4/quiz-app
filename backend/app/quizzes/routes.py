import re
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import asc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.quizzes.models import Answer, Category, PendingAnswer, PendingQuestion, Question
from app.quizzes.schemas import (
    AnswerPublic,
    CategoryCreateRequest,
    CategoryPublic,
    CorrectAnswerPublic,
    MessageResponse,
    PendingAnswerPublic,
    PendingQuestionCreateRequest,
    PendingQuestionPublic,
    QuestionDetailsPublic,
    QuestionSummaryPublic,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
from app.users.models import User
from app.users.routes import get_current_user


router = APIRouter(prefix="/quizzes", tags=["quizzes"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )

    return current_user


def slugify(value: str) -> str:
    normalized = value.strip().lower()
    normalized = re.sub(r"[^a-z0-9ąćęłńóśźż]+", "-", normalized)
    normalized = normalized.strip("-")

    return normalized or "category"


async def create_unique_slug(name: str, db: AsyncSession) -> str:
    base_slug = slugify(name)
    slug = base_slug
    counter = 2

    while True:
        result = await db.execute(select(Category).where(Category.slug == slug))
        existing_category = result.scalar_one_or_none()

        if existing_category is None:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


@router.get("/categories", response_model=list[CategoryPublic])
async def get_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryPublic]:
    result = await db.execute(
        select(Category)
        .where(Category.is_active.is_(True))
        .order_by(Category.name.asc())
    )
    categories = result.scalars().all()

    return [CategoryPublic.model_validate(category) for category in categories]


@router.post("/categories", response_model=CategoryPublic, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CategoryPublic:
    name = payload.name.strip()
    description = payload.description.strip()

    existing_result = await db.execute(select(Category).where(Category.name == name))
    existing_category = existing_result.scalar_one_or_none()

    if existing_category is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category with this name already exists",
        )

    category = Category(
        slug=await create_unique_slug(name, db),
        name=name,
        description=description,
        is_active=True,
        created_by_user_id=current_user.id,
    )

    db.add(category)

    await db.commit()
    await db.refresh(category)

    return CategoryPublic.model_validate(category)


@router.get("/categories/{slug}/questions", response_model=list[QuestionSummaryPublic])
async def get_questions_by_category(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> list[QuestionSummaryPublic]:
    category_result = await db.execute(
        select(Category).where(Category.slug == slug, Category.is_active.is_(True))
    )
    category = category_result.scalar_one_or_none()

    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    questions_result = await db.execute(
        select(Question)
        .where(Question.category_id == category.id)
        .order_by(Question.created_at.asc())
    )
    questions = questions_result.scalars().all()

    return [QuestionSummaryPublic.model_validate(question) for question in questions]


@router.get("/questions/{question_id}", response_model=QuestionDetailsPublic)
async def get_question(
    question_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> QuestionDetailsPublic:
    question_result = await db.execute(select(Question).where(Question.id == question_id))
    question = question_result.scalar_one_or_none()

    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    answers_result = await db.execute(
        select(Answer)
        .where(Answer.question_id == question.id)
        .order_by(asc(Answer.position))
    )
    answers = answers_result.scalars().all()

    return QuestionDetailsPublic(
        id=question.id,
        question=question.question,
        difficulty=question.difficulty,
        points=question.points,
        explanation_html=question.explanation_html,
        answers=[AnswerPublic.model_validate(answer) for answer in answers],
    )


@router.post("/questions/{question_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    question_id: UUID,
    payload: SubmitAnswerRequest,
    db: AsyncSession = Depends(get_db),
) -> SubmitAnswerResponse:
    question_result = await db.execute(select(Question).where(Question.id == question_id))
    question = question_result.scalar_one_or_none()

    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    selected_answer_result = await db.execute(
        select(Answer).where(
            Answer.id == payload.answer_id,
            Answer.question_id == question.id,
        )
    )
    selected_answer = selected_answer_result.scalar_one_or_none()

    if selected_answer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Answer not found")

    correct_answer_result = await db.execute(
        select(Answer).where(
            Answer.question_id == question.id,
            Answer.is_correct.is_(True),
        )
    )
    correct_answer = correct_answer_result.scalar_one()

    return SubmitAnswerResponse(
        is_correct=selected_answer.is_correct,
        correct_answer=CorrectAnswerPublic(
            id=correct_answer.id,
            text=correct_answer.text,
        ),
        explanation_html=question.explanation_html,
    )


@router.post("/categories/{category_id}/pending-questions", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def submit_pending_question(
    category_id: UUID,
    payload: PendingQuestionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    category_result = await db.execute(
        select(Category).where(Category.id == category_id, Category.is_active.is_(True))
    )
    category = category_result.scalar_one_or_none()

    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    pending_question = PendingQuestion(
        category_id=category.id,
        submitted_by_user_id=current_user.id,
        question=payload.question.strip(),
        difficulty=payload.difficulty.strip(),
        explanation_html=payload.explanation_html.strip(),
        points=payload.points,
        status="pending",
    )

    db.add(pending_question)
    await db.flush()

    for answer in payload.answers:
        db.add(
            PendingAnswer(
                pending_question_id=pending_question.id,
                text=answer.text.strip(),
                is_correct=answer.is_correct,
                position=answer.position,
            )
        )

    await db.commit()

    return MessageResponse(message="Question submitted for admin approval")


@router.get("/my/pending-questions", response_model=list[PendingQuestionPublic])
async def get_my_pending_questions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PendingQuestionPublic]:
    result = await db.execute(
        select(PendingQuestion, Category, User)
        .join(Category, PendingQuestion.category_id == Category.id)
        .outerjoin(User, PendingQuestion.submitted_by_user_id == User.id)
        .where(PendingQuestion.submitted_by_user_id == current_user.id)
        .order_by(PendingQuestion.created_at.desc())
    )
    rows = result.all()

    response: list[PendingQuestionPublic] = []

    for pending_question, category, user in rows:
        answers_result = await db.execute(
            select(PendingAnswer)
            .where(PendingAnswer.pending_question_id == pending_question.id)
            .order_by(PendingAnswer.position.asc())
        )
        answers = answers_result.scalars().all()

        response.append(
            PendingQuestionPublic(
                id=pending_question.id,
                category_id=category.id,
                category_name=category.name,
                submitted_by_username=user.username if user else None,
                question=pending_question.question,
                difficulty=pending_question.difficulty,
                explanation_html=pending_question.explanation_html,
                points=pending_question.points,
                status=pending_question.status,
                created_at=pending_question.created_at,
                answers=[
                    PendingAnswerPublic(
                        id=answer.id,
                        text=answer.text,
                        is_correct=answer.is_correct,
                        position=answer.position,
                    )
                    for answer in answers
                ],
            )
        )

    return response


@admin_router.get("/pending-questions", response_model=list[PendingQuestionPublic])
async def get_admin_pending_questions(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[PendingQuestionPublic]:
    result = await db.execute(
        select(PendingQuestion, Category, User)
        .join(Category, PendingQuestion.category_id == Category.id)
        .outerjoin(User, PendingQuestion.submitted_by_user_id == User.id)
        .where(PendingQuestion.status == "pending")
        .order_by(PendingQuestion.created_at.asc())
    )
    rows = result.all()

    response: list[PendingQuestionPublic] = []

    for pending_question, category, user in rows:
        answers_result = await db.execute(
            select(PendingAnswer)
            .where(PendingAnswer.pending_question_id == pending_question.id)
            .order_by(PendingAnswer.position.asc())
        )
        answers = answers_result.scalars().all()

        response.append(
            PendingQuestionPublic(
                id=pending_question.id,
                category_id=category.id,
                category_name=category.name,
                submitted_by_username=user.username if user else None,
                question=pending_question.question,
                difficulty=pending_question.difficulty,
                explanation_html=pending_question.explanation_html,
                points=pending_question.points,
                status=pending_question.status,
                created_at=pending_question.created_at,
                answers=[
                    PendingAnswerPublic(
                        id=answer.id,
                        text=answer.text,
                        is_correct=answer.is_correct,
                        position=answer.position,
                    )
                    for answer in answers
                ],
            )
        )

    return response


@admin_router.post("/pending-questions/{pending_question_id}/approve", response_model=MessageResponse)
async def approve_pending_question(
    pending_question_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    pending_question_result = await db.execute(
        select(PendingQuestion).where(
            PendingQuestion.id == pending_question_id,
            PendingQuestion.status == "pending",
        )
    )
    pending_question = pending_question_result.scalar_one_or_none()

    if pending_question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pending question not found")

    pending_answers_result = await db.execute(
        select(PendingAnswer)
        .where(PendingAnswer.pending_question_id == pending_question.id)
        .order_by(PendingAnswer.position.asc())
    )
    pending_answers = pending_answers_result.scalars().all()

    if len(pending_answers) != 4:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pending question must have 4 answers")

    correct_count = sum(1 for answer in pending_answers if answer.is_correct)

    if correct_count != 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pending question must have one correct answer")

    question = Question(
        category_id=pending_question.category_id,
        question=pending_question.question,
        difficulty=pending_question.difficulty,
        explanation_html=pending_question.explanation_html,
        points=pending_question.points,
    )

    db.add(question)
    await db.flush()

    for pending_answer in pending_answers:
        db.add(
            Answer(
                question_id=question.id,
                text=pending_answer.text,
                is_correct=pending_answer.is_correct,
                position=pending_answer.position,
            )
        )

    pending_question.status = "accepted"
    pending_question.reviewed_by_user_id = current_user.id
    pending_question.reviewed_at = datetime.now(timezone.utc)

    await db.commit()

    return MessageResponse(message="Question approved and added to quiz")


@admin_router.post("/pending-questions/{pending_question_id}/reject", response_model=MessageResponse)
async def reject_pending_question(
    pending_question_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    pending_question_result = await db.execute(
        select(PendingQuestion).where(
            PendingQuestion.id == pending_question_id,
            PendingQuestion.status == "pending",
        )
    )
    pending_question = pending_question_result.scalar_one_or_none()

    if pending_question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pending question not found")

    pending_question.status = "rejected"
    pending_question.reviewed_by_user_id = current_user.id
    pending_question.reviewed_at = datetime.now(timezone.utc)

    await db.commit()

    return MessageResponse(message="Question rejected")
