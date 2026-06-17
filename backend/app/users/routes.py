from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.users.models import User
from app.users.schemas import (
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    RankingUser,
    RegisterRequest,
    UpdateProfileRequest,
    UserPublic,
)
from app.users.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    try:
        parsed_user_id = UUID(user_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user id",
        ) from error

    result = await db.execute(select(User).where(User.id == parsed_user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


@auth_router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
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
        points=0,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(subject=str(user.id))

    return AuthResponse(
        access_token=access_token,
        user=UserPublic.model_validate(user),
    )


@auth_router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login or password",
        )

    access_token = create_access_token(subject=str(user.id))

    return AuthResponse(
        access_token=access_token,
        user=UserPublic.model_validate(user),
    )


@auth_router.get("/me", response_model=UserPublic)
async def me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)


@users_router.get("/ranking", response_model=list[RankingUser])
async def ranking(
    db: AsyncSession = Depends(get_db),
) -> list[RankingUser]:
    result = await db.execute(
        select(User)
        .order_by(desc(User.points), User.username.asc())
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
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )

    current_user.username = username

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password_hash = hash_password(payload.new_password)

    await db.commit()

    return MessageResponse(message="Password changed successfully")
