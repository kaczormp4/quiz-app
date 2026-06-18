from __future__ import annotations

import os

from fastapi import HTTPException, status


async def send_email(
    *,
    to: str,
    subject: str,
    html: str,
) -> None:
    api_key = os.getenv("RESEND_API_KEY")
    email_from = os.getenv("EMAIL_FROM", "DevPrep <onboarding@resend.dev>")

    if not api_key:
        print("")
        print("======================================")
        print("EMAIL DEV MODE - RESEND_API_KEY missing")
        print(f"TO: {to}")
        print(f"SUBJECT: {subject}")
        print("HTML:")
        print(html)
        print("======================================")
        print("")
        return

    try:
        import resend

        resend.api_key = api_key

        resend.Emails.send(
            {
                "from": email_from,
                "to": [to],
                "subject": subject,
                "html": html,
            }
        )
    except Exception as exc:
        print("")
        print("======================================")
        print("EMAIL PROVIDER ERROR")
        print(f"TO: {to}")
        print(f"FROM: {email_from}")
        print(f"ERROR: {exc}")
        print("======================================")
        print("")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Email provider error. "
                "Check RESEND_API_KEY, EMAIL_FROM and Resend domain verification."
            ),
        )
