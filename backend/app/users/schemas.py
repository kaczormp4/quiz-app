from datetime import date, datetime
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
    bio: str | None = Field(default=None, max_length=2000)
    linkedin_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    website_url: str | None = Field(default=None, max_length=500)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)


class WrongAnswerCreateRequest(BaseModel):
    question_id: UUID


class UserAnswerCreateRequest(BaseModel):
    question_id: UUID
    selected_answer_id: UUID
    is_correct: bool


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    username: str
    role: str
    points: int
    contribution_points: int
    current_streak: int
    longest_streak: int
    last_activity_date: date | None = None
    bio: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    website_url: str | None = None
    created_at: datetime


class RankingUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    role: str
    points: int
    contribution_points: int
    current_streak: int
    longest_streak: int
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


class AnswerHistoryItem(BaseModel):
    id: UUID
    question_id: UUID
    question: str
    selected_answer_id: UUID
    selected_answer_text: str
    is_correct: bool
    category_slug: str
    category_name: str
    created_at: datetime

class UserContributionCategory(BaseModel):
    id: UUID
    slug: str
    name: str
    created_at: datetime


class UserContributionQuestion(BaseModel):
    id: UUID
    category_name: str
    question: str
    difficulty: str
    points: int
    created_at: datetime


class UserContributionPendingQuestion(BaseModel):
    id: UUID
    category_name: str
    question: str
    difficulty: str
    points: int
    status: str
    created_at: datetime


class UserContributionsResponse(BaseModel):
    categories: list[UserContributionCategory]
    accepted_questions: list[UserContributionQuestion]
    pending_questions: list[UserContributionPendingQuestion]


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class MessageResponse(BaseModel):
    message: str


class UserAnswerResponse(BaseModel):
    message: str
    user: UserPublic
