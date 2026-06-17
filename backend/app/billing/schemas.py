from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PlanPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    description: str
    price_amount: int
    currency: str
    billing_period: str
    is_active: bool
    sort_order: int


class SubscriptionPublic(BaseModel):
    id: UUID
    status: str
    starts_at: Optional[datetime]
    expires_at: Optional[datetime]
    plan: PlanPublic


class BillingStatusResponse(BaseModel):
    is_pro: bool
    subscription_expires_at: Optional[datetime]
    active_subscription: Optional[SubscriptionPublic]


class CreateCheckoutRequest(BaseModel):
    plan_code: str


class CheckoutResponse(BaseModel):
    checkout_url: Optional[str]
    provider: str
    message: str
    plan: PlanPublic
