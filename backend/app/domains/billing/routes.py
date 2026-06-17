from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.billing.models import Plan, Subscription
from app.domains.billing.schemas import (
    BillingStatusResponse,
    CheckoutResponse,
    CreateCheckoutRequest,
    PlanPublic,
    SubscriptionPublic,
)
from app.core.database import get_db
from app.domains.users.models import User
from app.domains.users.routes import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


def calculate_days_left(expires_at: datetime | None) -> int | None:
    if expires_at is None:
        return None

    now = datetime.now(timezone.utc)

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    delta = expires_at - now

    return max(delta.days, 0)


def calculate_next_payment_at(subscription: Subscription | None) -> datetime | None:
    if subscription is None:
        return None

    plan_code = subscription.plan.code

    if plan_code == "pro_monthly":
        return subscription.expires_at

    return None


def calculate_access_status(
    current_user: User,
    subscription: Subscription | None,
) -> str:
    if subscription is None:
        return "free"

    if subscription.status != "active":
        return subscription.status

    if subscription.expires_at is None:
        return "active"

    now = datetime.now(timezone.utc)
    expires_at = subscription.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        return "expired"

    return "active"


@router.get("/plans", response_model=list[PlanPublic])
async def get_plans(db: AsyncSession = Depends(get_db)) -> list[PlanPublic]:
    result = await db.execute(
        select(Plan)
        .where(Plan.is_active.is_(True))
        .order_by(Plan.sort_order.asc())
    )

    return list(result.scalars().all())


@router.get("/me", response_model=BillingStatusResponse)
async def get_my_billing_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BillingStatusResponse:
    result = await db.execute(
        select(Subscription)
        .options(selectinload(Subscription.plan))
        .where(
            Subscription.user_id == current_user.id,
            Subscription.status == "active",
        )
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )

    active_subscription = result.scalars().first()

    free_plan_result = await db.execute(
        select(Plan).where(Plan.code == "free").limit(1)
    )
    free_plan = free_plan_result.scalars().first()

    current_plan = (
        active_subscription.plan
        if active_subscription is not None
        else free_plan
    )

    days_left = calculate_days_left(
        active_subscription.expires_at if active_subscription else None
    )

    next_payment_at = calculate_next_payment_at(active_subscription)

    access_status = calculate_access_status(current_user, active_subscription)

    should_show_renewal_warning = (
        days_left is not None
        and days_left <= 7
        and access_status == "active"
    )

    return BillingStatusResponse(
        is_pro=current_user.is_pro,
        access_status=access_status,
        current_plan=(
            PlanPublic.model_validate(current_plan)
            if current_plan is not None
            else None
        ),
        subscription_expires_at=(
            active_subscription.expires_at
            if active_subscription is not None
            else current_user.subscription_expires_at
        ),
        next_payment_at=next_payment_at,
        days_left=days_left,
        should_show_renewal_warning=should_show_renewal_warning,
        active_subscription=(
            SubscriptionPublic(
                id=active_subscription.id,
                status=active_subscription.status,
                starts_at=active_subscription.starts_at,
                expires_at=active_subscription.expires_at,
                plan=PlanPublic.model_validate(active_subscription.plan),
            )
            if active_subscription
            else None
        ),
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    payload: CreateCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckoutResponse:
    result = await db.execute(
        select(Plan).where(
            Plan.code == payload.plan_code,
            Plan.is_active.is_(True),
        )
    )
    plan = result.scalars().first()

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found",
        )

    return CheckoutResponse(
        checkout_url=None,
        provider="coming_soon",
        message="Payments are not enabled yet. This endpoint is ready for future Stripe, Paddle or PayU integration.",
        plan=PlanPublic.model_validate(plan),
    )
