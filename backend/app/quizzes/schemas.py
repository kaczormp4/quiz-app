from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class CategoryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    name: str
    description: Optional[str] = None


class CategoryCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None


class AnswerPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    text: str
    position: int


class QuestionSummaryPublic(BaseModel):
    id: UUID
    category_id: UUID
    question: str
    difficulty: str
    points: int
    created_by_username: Optional[str] = None
    approved_by_username: Optional[str] = None
    views_count: int = 0


class QuestionPublic(BaseModel):
    id: UUID
    category_id: UUID
    question: str
    difficulty: str
    explanation_html: str
    points: int
    answers: list[AnswerPublic]
    created_by_username: Optional[str] = None
    approved_by_username: Optional[str] = None
    views_count: int = 0


class SubmitAnswerRequest(BaseModel):
    answer_id: UUID


class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: AnswerPublic
    explanation_html: str


class PendingAnswerCreateRequest(BaseModel):
    text: str
    is_correct: bool
    position: int


class PendingAnswerPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    text: str
    is_correct: bool
    position: int


class PendingQuestionCreateRequest(BaseModel):
    question: str
    difficulty: str
    explanation_html: str
    points: int = 1
    answers: list[PendingAnswerCreateRequest]

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, answers: list[PendingAnswerCreateRequest]) -> list[PendingAnswerCreateRequest]:
        if len(answers) != 4:
            raise ValueError("Question must have exactly 4 answers")

        correct_answers_count = sum(1 for answer in answers if answer.is_correct)

        if correct_answers_count != 1:
            raise ValueError("Question must have exactly one correct answer")

        positions = sorted(answer.position for answer in answers)

        if positions != [1, 2, 3, 4]:
            raise ValueError("Answer positions must be 1, 2, 3 and 4")

        return answers


class PendingQuestionPublic(BaseModel):
    id: UUID
    category_id: UUID
    category_name: str
    submitted_by_user_id: Optional[UUID] = None
    submitted_by_username: Optional[str] = None
    reviewed_by_user_id: Optional[UUID] = None
    reviewed_by_username: Optional[str] = None
    question: str
    difficulty: str
    explanation_html: str
    points: int
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    answers: list[PendingAnswerPublic]
