from __future__ import annotations

import os


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
    except ImportError:
        print("resend package is not installed. Email was not sent.")
        return

    resend.api_key = api_key

    resend.Emails.send(
        {
            "from": email_from,
            "to": [to],
            "subject": subject,
            "html": html,
        }
    )
