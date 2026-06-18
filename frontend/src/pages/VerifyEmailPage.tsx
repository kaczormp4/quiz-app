import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? "https://quiz-app-api-gujn.onrender.com"
    : "http://localhost:8000");

type VerifyState = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("idle");
  const [message, setMessage] = useState<string>("");

  const hasToken = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      setState("loading");

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.detail ?? "Email verification failed.");
        }

        setState("success");
        setMessage(data?.message ?? "Email has been verified.");
      } catch (error) {
        setState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Email verification failed.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-white">
          {state === "success" ? "✓" : state === "error" ? "!" : "…"}
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-950">
          {state === "success"
            ? "Email verified"
            : state === "loading"
              ? "Verifying email"
              : "Email verification"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {hasToken ? message || "Please wait..." : "Verification token is missing."}
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Go to login
          </Link>

          <Link
            to="/"
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
