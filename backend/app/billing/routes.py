from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.billing.models import Plan, Subscription
from app.billing.schemas import (
    BillingStatusResponse,
    CheckoutResponse,
    CreateCheckoutRequest,
    PlanPublic,
    SubscriptionPublic,
)
from app.core.database import get_db
from app.users.models import User
from app.users.routes import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


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

    return BillingStatusResponse(
        is_pro=current_user.is_pro,
        subscription_expires_at=current_user.subscription_expires_at,
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
