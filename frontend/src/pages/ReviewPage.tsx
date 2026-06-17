import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../app/providers/AuthProvider";
import { getWrongAnswersRequest } from "../features/auth/api";

export default function ReviewPage() {
  const { token } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wrong-answers"],
    queryFn: () => getWrongAnswersRequest(token!),
    enabled: Boolean(token),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">Do powtórzenia</h1>
        <p className="mt-2 text-slate-500">
          Tutaj trafiają pytania, na które odpowiedziałeś niepoprawnie.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Ładowanie pytań do powtórki...
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error instanceof Error ? error.message : "Nie udało się pobrać powtórek"}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4">
          {data.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {item.category_name}
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {item.difficulty}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-950">
                {item.question}
              </h2>

              <div
                className="prose prose-slate mt-4 max-w-none text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item.explanation_html),
                }}
              />

              <Link
                to={`/questions/${item.question_id}`}
                className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Otwórz pytanie
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Nie masz jeszcze pytań do powtórzenia.
        </div>
      )}
    </main>
  );
}
