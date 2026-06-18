from __future__ import annotations

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.email import send_email
from app.domains.users.models import User
from app.domains.users.routes import get_current_user


EMAIL_VERIFICATION_TOKEN_TTL_HOURS = 24

router = APIRouter(prefix="/auth", tags=["auth"])


class VerifyEmailRequest(BaseModel):
    token: str


class VerificationEmailResponse(BaseModel):
    message: str


def hash_email_verification_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def build_verification_email_html(username: str, verification_link: str) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Confirm your DevPrep email</h2>
      <p>Hi {username},</p>
      <p>Click the button below to verify your email address.</p>
      <p>
        <a href="{verification_link}"
           style="display:inline-block;background:#020617;color:#ffffff;
                  padding:12px 18px;border-radius:12px;text-decoration:none;
                  font-weight:bold;">
          Verify email
        </a>
      </p>
      <p>This link is valid for 24 hours.</p>
      <p>If you did not create an account, you can ignore this email.</p>
    </div>
    """


async def issue_and_send_verification_email(
    *,
    db: AsyncSession,
    user: User,
) -> None:
    if getattr(user, "is_email_verified", False):
        return

    token = secrets.token_urlsafe(32)
    token_hash = hash_email_verification_token(token)

    now = datetime.now(timezone.utc)

    user.email_verification_token_hash = token_hash
    user.email_verification_sent_at = now

    await db.commit()
    await db.refresh(user)

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    verification_link = f"{frontend_url}/verify-email?token={token}"

    html = build_verification_email_html(
        username=user.username,
        verification_link=verification_link,
    )

    await send_email(
        to=user.email,
        subject="Confirm your DevPrep email",
        html=html,
    )


@router.post("/resend-verification-email", response_model=VerificationEmailResponse)
async def resend_verification_email(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VerificationEmailResponse:
    if current_user.is_email_verified:
        return VerificationEmailResponse(message="Email is already verified.")

    await issue_and_send_verification_email(db=db, user=current_user)

    return VerificationEmailResponse(
        message="Verification email has been sent. The link is valid for 24 hours.",
    )


@router.post("/send-verification-email", response_model=VerificationEmailResponse)
async def send_verification_email(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VerificationEmailResponse:
    return await resend_verification_email(
        current_user=current_user,
        db=db,
    )


@router.post("/verify-email", response_model=VerificationEmailResponse)
async def verify_email(
    payload: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
) -> VerificationEmailResponse:
    token_hash = hash_email_verification_token(payload.token)

    result = await db.execute(
        select(User).where(User.email_verification_token_hash == token_hash)
    )
    user = result.scalars().first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token.",
        )

    if user.email_verification_sent_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token.",
        )

    now = datetime.now(timezone.utc)
    sent_at = user.email_verification_sent_at

    if sent_at.tzinfo is None:
        sent_at = sent_at.replace(tzinfo=timezone.utc)

    if now - sent_at > timedelta(hours=EMAIL_VERIFICATION_TOKEN_TTL_HOURS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link has expired. Please request a new one.",
        )

    user.is_email_verified = True
    user.email_verified_at = now
    user.email_verification_token_hash = None
    user.email_verification_sent_at = None

    await db.commit()

    return VerificationEmailResponse(message="Email has been verified.")


@router.get("/verify-email", response_model=VerificationEmailResponse)
async def verify_email_from_link(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> VerificationEmailResponse:
    return await verify_email(
        payload=VerifyEmailRequest(token=token),
        db=db,
    )
