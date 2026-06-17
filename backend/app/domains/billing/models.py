from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.domains.users.models import User  # noqa: F401 - register users table for foreign keys


class Plan(Base):
    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    price_amount = Column(Integer, nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="USD")
    billing_period = Column(String(30), nullable=False)
    features = Column(JSONB, nullable=False, default=list)

    max_difficulty = Column(String(30), nullable=False, default="easy")
    can_answer_questions = Column(Boolean, nullable=False, default=False)
    can_view_explanations = Column(Boolean, nullable=False, default=False)
    can_use_review = Column(Boolean, nullable=False, default=False)
    can_submit_questions = Column(Boolean, nullable=False, default=False)
    has_unlimited_questions = Column(Boolean, nullable=False, default=False)

    is_active = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    subscriptions = relationship("Subscription", back_populates="plan")
    payments = relationship("Payment", back_populates="plan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id", ondelete="RESTRICT"), index=True, nullable=False)
    status = Column(String(30), nullable=False, default="pending")
    starts_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    plan = relationship("Plan", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id", ondelete="RESTRICT"), index=True, nullable=False)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="SET NULL"), index=True, nullable=True)
    provider = Column(String(50), nullable=False, default="manual")
    provider_payment_id = Column(String(255), nullable=True)
    amount = Column(Integer, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(30), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    plan = relationship("Plan", back_populates="payments")
    subscription = relationship("Subscription", back_populates="payments")
