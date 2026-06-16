import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCategoryQuestions } from "../features/quizzes/api";

export function QuestionsPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["category-questions", slug],
    queryFn: () => getCategoryQuestions(slug ?? ""),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="text-slate-500">Loading questions...</p>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="font-semibold text-red-600">{error.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <Link to="/" className="font-bold text-blue-600">
          ← Kategorie
        </Link>

        <header className="my-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
            Kategoria
          </p>

          <h1 className="text-5xl font-bold tracking-tight">{slug}</h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Wybierz pytanie i sprawdź odpowiedź.
          </p>
        </header>

        <section className="grid gap-4">
          {data?.map((question, index) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                    Pytanie {index + 1}
                  </p>

                  <h2 className="text-xl font-bold text-slate-950">
                    {question.question}
                  </h2>
                </div>

                <div className="flex shrink-0 gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {question.difficulty}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {question.points} pkt
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
