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
    access_status: str
    current_plan: Optional[PlanPublic]
    active_subscription: Optional[SubscriptionPublic]
    subscription_expires_at: Optional[datetime]
    next_payment_at: Optional[datetime]
    days_left: Optional[int]
    should_show_renewal_warning: bool


class CreateCheckoutRequest(BaseModel):
    plan_code: str


class CheckoutResponse(BaseModel):
    checkout_url: Optional[str]
    provider: str
    message: str
    plan: PlanPublic
