import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

type ConfirmState = "loading" | "success" | "error";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getAuthToken() {
  return (
    localStorage.getItem("quiz_app_token") ??
    localStorage.getItem("access_token") ??
    localStorage.getItem("token")
  );
}

export function BillingSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<ConfirmState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const hasConfirmedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setMessage(
        t("billingSuccess.missingSession", "Missing Stripe checkout session ID."),
      );
      return;
    }

    if (hasConfirmedRef.current) {
      return;
    }

    hasConfirmedRef.current = true;

    const confirmPayment = async () => {
      const token = getAuthToken();

      if (!token) {
        setState("error");
        setMessage(
          t(
            "billingSuccess.notLoggedIn",
            "You are not logged in. Please log in and check your billing status.",
          ),
        );
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/billing/stripe/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail ??
              t("billingSuccess.confirmationFailed", "Payment confirmation failed."),
          );
        }

        setState("success");
        setMessage(
          data?.status === "already_confirmed"
            ? t(
                "billingSuccess.alreadyActivated",
                "Your premium access was already activated.",
              )
            : t(
                "billingSuccess.activated",
                "Your premium access has been activated successfully.",
              ),
        );
      } catch (error) {
        setState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : t("billingSuccess.confirmationFailed", "Payment confirmation failed."),
        );
      }
    };

    confirmPayment();
  }, [sessionId, t]);

  const isSuccess = state === "success";
  const isLoading = state === "loading";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div
          className={[
            "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl",
            isSuccess ? "bg-emerald-100 text-emerald-700" : "",
            isLoading ? "bg-slate-100 text-slate-700" : "",
            state === "error" ? "bg-red-100 text-red-700" : "",
          ].join(" ")}
        >
          {isLoading ? "…" : isSuccess ? "✓" : "!"}
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          {isLoading
            ? t("billingSuccess.confirmingTitle", "Confirming payment")
            : isSuccess
              ? t("billingSuccess.successTitle", "Payment successful")
              : t("billingSuccess.errorTitle", "Payment confirmation failed")}
        </h1>

        <p className="mt-4 text-slate-600">
          {message ?? t("billingSuccess.confirmingMessage", "Confirming your payment...")}
        </p>

        {sessionId ? (
          <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            {t("billingSuccess.sessionId", "Session ID")}: {sessionId}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {t("billingSuccess.goToApp", "Go to app")}
          </Link>

          <Link
            to="/pricing"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("billingSuccess.backToPricing", "Back to pricing")}
          </Link>
        </div>
      </div>
    </main>
  );
}
