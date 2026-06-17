import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../features/quizzes/api";

export function CategoriesPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="text-slate-500">Loading categories...</p>
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
        <header className="mb-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
            Quiz App
          </p>

          <h1 className="text-5xl font-bold tracking-tight">Kategorie</h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Wybierz kategorię i rozpocznij quiz.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {data?.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl"
            >
              <h2 className="text-2xl font-bold text-slate-950">
                {category.name}
              </h2>

              <p className="mt-3 text-slate-600">{category.description}</p>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}

export default CategoriesPage;
