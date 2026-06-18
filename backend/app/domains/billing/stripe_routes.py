from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Literal

import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.billing.models import Payment, Plan, Subscription
from app.domains.users.models import User
from app.domains.users.routes import get_current_user


router = APIRouter(tags=["billing"])


class CheckoutRequest(BaseModel):
    plan_code: Literal["pro_30_days", "pro_monthly", "pro_yearly"]


class CheckoutResponse(BaseModel):
    checkout_url: str


class ConfirmCheckoutRequest(BaseModel):
    session_id: str


class ConfirmCheckoutResponse(BaseModel):
    status: str
    plan_code: str
    expires_at: datetime


PLANS = {
    "pro_30_days": {
        "name": "30-Day Pass",
        "description": "30 days of premium access to IT interview preparation quizzes and learning materials.",
        "amount": 5900,
        "currency": "pln",
        "mode": "payment",
        "access_days": 30,
    },
    "pro_monthly": {
        "name": "Monthly Subscription",
        "description": "Monthly premium access to IT interview preparation quizzes and learning materials.",
        "amount": 3900,
        "currency": "pln",
        "mode": "subscription",
        "recurring_interval": "month",
        "access_days": 30,
    },
    "pro_yearly": {
        "name": "Annual Upfront",
        "description": "One year of premium access to IT interview preparation quizzes and learning materials.",
        "amount": 39900,
        "currency": "pln",
        "mode": "payment",
        "access_days": 365,
    },
}


def get_stripe_value(obj, key: str, default=None):
    if obj is None:
        return default

    if isinstance(obj, dict):
        return obj.get(key, default)

    return getattr(obj, key, default)


def configure_stripe() -> None:
    stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")

    if not stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="STRIPE_SECRET_KEY is not configured.",
        )

    stripe.api_key = stripe_secret_key


async def get_user_in_current_session(
    *,
    db: AsyncSession,
    user_id,
) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


async def get_plan_by_code(
    *,
    db: AsyncSession,
    plan_code: str,
) -> Plan:
    result = await db.execute(
        select(Plan).where(
            Plan.code == plan_code,
            Plan.is_active.is_(True),
        )
    )
    plan = result.scalars().first()

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found.",
        )

    return plan


@router.post("/billing/stripe/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
):
    configure_stripe()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    plan = PLANS.get(payload.plan_code)

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown plan code.",
        )

    price_data = {
        "currency": plan["currency"],
        "product_data": {
            "name": plan["name"],
            "description": plan["description"],
        },
        "unit_amount": plan["amount"],
    }

    if plan["mode"] == "subscription":
        price_data["recurring"] = {
            "interval": plan["recurring_interval"],
        }

    metadata = {
        "user_id": str(current_user.id),
        "plan_code": payload.plan_code,
    }

    session_payload = {
        "mode": plan["mode"],
        "payment_method_types": ["card"] if plan["mode"] == "subscription" else ["card", "blik", "p24"],
        "line_items": [
            {
                "price_data": price_data,
                "quantity": 1,
            }
        ],
        "success_url": f"{frontend_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
        "cancel_url": f"{frontend_url}/pricing",
        "customer_email": current_user.email,
        "metadata": metadata,
    }

    if plan["mode"] == "subscription":
        session_payload["subscription_data"] = {
            "metadata": metadata,
        }

    try:
        session = stripe.checkout.Session.create(**session_payload)
    except Exception as exc:
        print("")
        print("======================================")
        print("STRIPE CHECKOUT ERROR")
        print(f"ERROR: {exc}")
        print("======================================")
        print("")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Stripe checkout error: {exc}",
        )

    if not session.url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Stripe did not return checkout URL.",
        )

    return CheckoutResponse(checkout_url=session.url)


@router.post("/billing/stripe/confirm", response_model=ConfirmCheckoutResponse)
async def confirm_checkout_session(
    payload: ConfirmCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConfirmCheckoutResponse:
    configure_stripe()

    try:
        session = stripe.checkout.Session.retrieve(payload.session_id)
    except Exception as exc:
        print("")
        print("======================================")
        print("STRIPE SESSION RETRIEVE ERROR")
        print(f"ERROR: {exc}")
        print("======================================")
        print("")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not retrieve Stripe checkout session.",
        )

    metadata = get_stripe_value(session, "metadata", {}) or {}
    session_user_id = get_stripe_value(metadata, "user_id")
    plan_code = get_stripe_value(metadata, "plan_code")

    if session_user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Checkout session does not belong to the current user.",
        )

    if plan_code not in PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown plan code in Stripe session.",
        )

    if get_stripe_value(session, "payment_status") != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment is not completed yet.",
        )

    provider_payment_id = str(
        get_stripe_value(session, "payment_intent")
        or get_stripe_value(session, "subscription")
        or get_stripe_value(session, "id")
        or payload.session_id
    )

    existing_payment_result = await db.execute(
        select(Payment).where(
            Payment.provider == "stripe",
            Payment.provider_payment_id == provider_payment_id,
        )
    )
    existing_payment = existing_payment_result.scalars().first()

    user = await get_user_in_current_session(db=db, user_id=current_user.id)
    plan = await get_plan_by_code(db=db, plan_code=plan_code)

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=PLANS[plan_code]["access_days"])

    if existing_payment is not None:
        user.is_pro = True
        user.subscription_expires_at = expires_at
        await db.commit()

        return ConfirmCheckoutResponse(
            status="already_confirmed",
            plan_code=plan_code,
            expires_at=expires_at,
        )

    active_subscriptions_result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user.id,
            Subscription.status == "active",
        )
    )
    active_subscriptions = active_subscriptions_result.scalars().all()

    for subscription in active_subscriptions:
        subscription.status = "expired"
        subscription.cancelled_at = now

    subscription = Subscription(
        user_id=user.id,
        plan_id=plan.id,
        status="active",
        starts_at=now,
        expires_at=expires_at,
    )

    db.add(subscription)
    await db.flush()

    payment = Payment(
        user_id=user.id,
        plan_id=plan.id,
        subscription_id=subscription.id,
        provider="stripe",
        provider_payment_id=provider_payment_id,
        amount=int(get_stripe_value(session, "amount_total") or PLANS[plan_code]["amount"]),
        currency=str(get_stripe_value(session, "currency") or PLANS[plan_code]["currency"]).upper(),
        status="paid",
    )

    db.add(payment)

    user.is_pro = True
    user.subscription_expires_at = expires_at

    await db.commit()

    return ConfirmCheckoutResponse(
        status="confirmed",
        plan_code=plan_code,
        expires_at=expires_at,
    )
