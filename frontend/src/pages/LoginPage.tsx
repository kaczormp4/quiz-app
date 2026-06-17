import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../app/providers/AuthProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({
        login: loginValue,
        password,
      });

      navigate("/quizzes");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nie udało się zalogować",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Logowanie</h1>
        <p className="mt-2 text-sm text-slate-500">
          Zaloguj się za pomocą username lub emaila.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Login albo email
            </span>
            <input
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder="bartek albo email@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Hasło</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder="Minimum 6 znaków"
              required
            />
          </label>

          {errorMessage ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logowanie..." : "Zaloguj"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Nie masz konta?{" "}
          <Link to="/register" className="font-semibold text-slate-950">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </main>
  );
}
