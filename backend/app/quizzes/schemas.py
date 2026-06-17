from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    name: str
    description: str
    is_active: bool
    created_at: datetime


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(default="", max_length=2000)


class QuestionSummaryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question: str
    difficulty: str
    points: int
    created_at: datetime


class AnswerPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    text: str
    position: int


class QuestionDetailsPublic(BaseModel):
    id: UUID
    question: str
    difficulty: str
    points: int
    explanation_html: str
    answers: list[AnswerPublic]


class SubmitAnswerRequest(BaseModel):
    answer_id: UUID


class CorrectAnswerPublic(BaseModel):
    id: UUID
    text: str


class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: CorrectAnswerPublic
    explanation_html: str


class PendingAnswerCreateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    is_correct: bool
    position: int


class PendingQuestionCreateRequest(BaseModel):
    question: str = Field(min_length=5, max_length=4000)
    difficulty: str = Field(min_length=2, max_length=30)
    explanation_html: str = Field(min_length=5, max_length=8000)
    points: int = Field(default=1, ge=1, le=10)
    answers: list[PendingAnswerCreateRequest]

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, answers: list[PendingAnswerCreateRequest]):
        if len(answers) != 4:
            raise ValueError("Question must have exactly 4 answers")

        correct_count = sum(1 for answer in answers if answer.is_correct)

        if correct_count != 1:
            raise ValueError("Question must have exactly one correct answer")

        positions = sorted(answer.position for answer in answers)

        if positions != [1, 2, 3, 4]:
            raise ValueError("Answers must have positions 1, 2, 3, 4")

        return answers


class PendingAnswerPublic(BaseModel):
    id: UUID
    text: str
    is_correct: bool
    position: int


class PendingQuestionPublic(BaseModel):
    id: UUID
    category_id: UUID
    category_name: str
    submitted_by_username: str | None
    question: str
    difficulty: str
    explanation_html: str
    points: int
    status: str
    created_at: datetime
    answers: list[PendingAnswerPublic]


class MessageResponse(BaseModel):
    message: str
