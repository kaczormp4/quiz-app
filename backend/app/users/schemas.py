from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    login: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class UpdateProfileRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    linkedin_url: str | None = Field(default=None, max_length=500)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)


class WrongAnswerCreateRequest(BaseModel):
    question_id: UUID


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    username: str
    points: int
    linkedin_url: str | None = None
    created_at: datetime


class RankingUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    points: int
    linkedin_url: str | None = None
    created_at: datetime


class WrongAnswerReviewItem(BaseModel):
    id: UUID
    question_id: UUID
    question: str
    difficulty: str
    explanation_html: str
    category_slug: str
    category_name: str
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class MessageResponse(BaseModel):
    message: str
