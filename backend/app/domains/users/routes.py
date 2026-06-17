from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.domains.quizzes.models import Answer, Category, PendingQuestion, Question
from app.domains.users.models import User, UserAnswer, WrongAnswer
from app.domains.users.schemas import (
    AnswerHistoryItem,
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    RankingUser,
    RegisterRequest,
    UpdateProfileRequest,
    UserAnswerCreateRequest,
    UserAnswerResponse,
    UserContributionCategory,
    UserContributionPendingQuestion,
    UserContributionQuestion,
    UserContributionsResponse,
    UserPublic,
    WrongAnswerCreateRequest,
    WrongAnswerReviewItem,
)
from app.domains.users.security import create_access_token, decode_access_token, hash_password, verify_password


auth_router = APIRouter(prefix="/auth", tags=["auth"])
users_router = APIRouter(prefix="/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_access_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    try:
        parsed_user_id = UUID(user_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user id") from error

    result = await db.execute(select(User).where(User.id == parsed_user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()

    return normalized or None


def update_user_streak(user: User) -> None:
    today = date.today()

    if user.last_activity_date is None:
        user.current_streak = 1
    elif user.last_activity_date == today:
        return
    elif user.last_activity_date == today - timedelta(days=1):
        user.current_streak += 1
    else:
        user.current_streak = 1

    user.last_activity_date = today
    user.longest_streak = max(user.longest_streak, user.current_streak)


@auth_router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    email = payload.email.strip().lower()
    username = payload.username.strip()

    existing_user_result = await db.execute(
        select(User).where(
            or_(
                func.lower(User.email) == email,
                func.lower(User.username) == username.lower(),
            )
        )
    )
    existing_user = existing_user_result.scalar_one_or_none()

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email or username already exists",
        )

    user = User(
        email=email,
        username=username,
        password_hash=hash_password(payload.password),
        role="user",
        points=0,
        current_streak=0,
        longest_streak=0,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(subject=str(user.id))

    return AuthResponse(access_token=access_token, user=UserPublic.model_validate(user))


@auth_router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    login_value = payload.login.strip().lower()

    result = await db.execute(
        select(User).where(
            or_(
                func.lower(User.email) == login_value,
                func.lower(User.username) == login_value,
            )
        )
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login or password")

    access_token = create_access_token(subject=str(user.id))

    return AuthResponse(access_token=access_token, user=UserPublic.model_validate(user))


@auth_router.get("/me", response_model=UserPublic)
async def me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)


@users_router.get("/ranking", response_model=list[RankingUser])
async def ranking(db: AsyncSession = Depends(get_db)) -> list[RankingUser]:
    result = await db.execute(
        select(User)
        .order_by(desc(User.points), desc(User.current_streak), User.username.asc())
        .limit(50)
    )
    users = result.scalars().all()

    return [RankingUser.model_validate(user) for user in users]


@users_router.patch("/me/profile", response_model=UserPublic)
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    username = payload.username.strip()

    existing_user_result = await db.execute(
        select(User).where(
            func.lower(User.username) == username.lower(),
            User.id != current_user.id,
        )
    )
    existing_user = existing_user_result.scalar_one_or_none()

    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken")

    current_user.username = username
    current_user.bio = normalize_optional_text(payload.bio)
    current_user.linkedin_url = normalize_optional_text(payload.linkedin_url)
    current_user.github_url = normalize_optional_text(payload.github_url)
    current_user.website_url = normalize_optional_text(payload.website_url)

    await db.commit()
    await db.refresh(current_user)

    return UserPublic.model_validate(current_user)


@users_router.patch("/me/password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.password_hash = hash_password(payload.new_password)

    await db.commit()

    return MessageResponse(message="Password changed successfully")


@users_router.post("/me/answers", response_model=UserAnswerResponse, status_code=status.HTTP_201_CREATED)
async def record_answer(
    payload: UserAnswerCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserAnswerResponse:
    question_result = await db.execute(select(Question).where(Question.id == payload.question_id))
    question = question_result.scalar_one_or_none()

    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    answer_result = await db.execute(
        select(Answer).where(
            Answer.id == payload.selected_answer_id,
            Answer.question_id == payload.question_id,
        )
    )
    answer = answer_result.scalar_one_or_none()

    if answer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected answer not found")

    user_answer = UserAnswer(
        user_id=current_user.id,
        question_id=payload.question_id,
        selected_answer_id=payload.selected_answer_id,
        is_correct=payload.is_correct,
    )

    current_user.points += 1
    update_user_streak(current_user)

    db.add(user_answer)

    await db.commit()
    await db.refresh(current_user)

    return UserAnswerResponse(
        message="Answer recorded successfully",
        user=UserPublic.model_validate(current_user),
    )


@users_router.get("/me/answers", response_model=list[AnswerHistoryItem])
async def get_answer_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AnswerHistoryItem]:
    result = await db.execute(
        select(UserAnswer, Question, Answer, Category)
        .join(Question, UserAnswer.question_id == Question.id)
        .join(Answer, UserAnswer.selected_answer_id == Answer.id)
        .join(Category, Question.category_id == Category.id)
        .where(UserAnswer.user_id == current_user.id)
        .order_by(desc(UserAnswer.created_at))
        .limit(100)
    )

    rows = result.all()

    return [
        AnswerHistoryItem(
            id=user_answer.id,
            question_id=question.id,
            question=question.question,
            selected_answer_id=answer.id,
            selected_answer_text=answer.text,
            is_correct=user_answer.is_correct,
            category_slug=category.slug,
            category_name=category.name,
            created_at=user_answer.created_at,
        )
        for user_answer, question, answer, category in rows
    ]


@users_router.post("/me/wrong-answers", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def add_wrong_answer(
    payload: WrongAnswerCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    question_result = await db.execute(select(Question).where(Question.id == payload.question_id))
    question = question_result.scalar_one_or_none()

    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    existing_result = await db.execute(
        select(WrongAnswer).where(
            WrongAnswer.user_id == current_user.id,
            WrongAnswer.question_id == payload.question_id,
        )
    )
    existing_wrong_answer = existing_result.scalar_one_or_none()

    if existing_wrong_answer is None:
        wrong_answer = WrongAnswer(user_id=current_user.id, question_id=payload.question_id)
        db.add(wrong_answer)
        await db.commit()

    return MessageResponse(message="Question added to review list")


@users_router.get("/me/wrong-answers", response_model=list[WrongAnswerReviewItem])
async def get_wrong_answers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[WrongAnswerReviewItem]:
    result = await db.execute(
        select(WrongAnswer, Question, Category)
        .join(Question, WrongAnswer.question_id == Question.id)
        .join(Category, Question.category_id == Category.id)
        .where(WrongAnswer.user_id == current_user.id)
        .order_by(desc(WrongAnswer.created_at))
    )

    rows = result.all()

    return [
        WrongAnswerReviewItem(
            id=wrong_answer.id,
            question_id=question.id,
            question=question.question,
            difficulty=question.difficulty,
            explanation_html=question.explanation_html,
            category_slug=category.slug,
            category_name=category.name,
            created_at=wrong_answer.created_at,
        )
        for wrong_answer, question, category in rows
    ]


@users_router.get("/me/contributions", response_model=UserContributionsResponse)
async def get_my_contributions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserContributionsResponse:
    categories_result = await db.execute(
        select(Category)
        .where(Category.created_by_user_id == current_user.id)
        .order_by(Category.created_at.desc())
    )
    categories = categories_result.scalars().all()

    accepted_questions_result = await db.execute(
        select(Question, Category)
        .join(Category, Question.category_id == Category.id)
        .where(Question.created_by_user_id == current_user.id)
        .order_by(Question.created_at.desc())
    )
    accepted_question_rows = accepted_questions_result.all()

    pending_questions_result = await db.execute(
        select(PendingQuestion, Category)
        .join(Category, PendingQuestion.category_id == Category.id)
        .where(PendingQuestion.submitted_by_user_id == current_user.id)
        .order_by(PendingQuestion.created_at.desc())
    )
    pending_question_rows = pending_questions_result.all()

    return UserContributionsResponse(
        categories=[
            UserContributionCategory(
                id=category.id,
                slug=category.slug,
                name=category.name,
                created_at=category.created_at,
            )
            for category in categories
        ],
        accepted_questions=[
            UserContributionQuestion(
                id=question.id,
                category_name=category.name,
                question=question.question,
                difficulty=question.difficulty,
                points=question.points,
                created_at=question.created_at,
            )
            for question, category in accepted_question_rows
        ],
        pending_questions=[
            UserContributionPendingQuestion(
                id=pending_question.id,
                category_name=category.name,
                question=pending_question.question,
                difficulty=pending_question.difficulty,
                points=pending_question.points,
                status=pending_question.status,
                created_at=pending_question.created_at,
            )
            for pending_question, category in pending_question_rows
        ],
    )
