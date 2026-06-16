import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CategoryResponse(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnswerResponse(BaseModel):
    id: uuid.UUID
    text: str
    position: int

    model_config = ConfigDict(from_attributes=True)


class QuestionListItemResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    question: str
    difficulty: str
    points: int

    model_config = ConfigDict(from_attributes=True)


class QuestionDetailsResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    question: str
    difficulty: str
    points: int
    answers: list[AnswerResponse]

    model_config = ConfigDict(from_attributes=True)