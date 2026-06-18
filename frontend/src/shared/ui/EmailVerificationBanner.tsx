import { useState } from "react";

import { useAuth } from "../../app/providers/AuthProvider";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? "https://quiz-app-api-gujn.onrender.com"
    : "http://localhost:8000");

export default function EmailVerificationBanner() {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  if (!token) {
    return null;
  }

  const isEmailVerified =
    (user as { is_email_verified?: boolean } | null | undefined)
      ?.is_email_verified === true;

  if (isEmailVerified) {
    return null;
  }

  const sendVerificationEmail = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/resend-verification-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "Could not send verification email.");
      }

      setStatus("success");
      setMessage(
        data?.message ??
          "Verification email has been sent. The link is valid for 24 hours.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not send verification email.",
      );
    }
  };

  return (
    <section className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-amber-950">
            Your email is not verified
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Confirm your email to secure your account. The verification link is
            valid for 24 hours.
          </p>

          {message ? (
            <p
              className={`mt-2 text-sm font-semibold ${
                status === "error" ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {message}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={sendVerificationEmail}
          disabled={status === "loading"}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sending..." : "Send verification email"}
        </button>
      </div>
    </section>
  );
}
