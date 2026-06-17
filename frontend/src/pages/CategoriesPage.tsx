import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getCategories } from "../features/quizzes/api";

export default function CategoriesPage() {
  const { t } = useTranslation();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">
          {t("categories.title")}
        </h1>
        <p className="mt-2 text-slate-500">
          {t("categories.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("common.loading")}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error instanceof Error ? error.message : t("categories.loadError")}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <h2 className="text-xl font-bold text-slate-950">
                {category.name}
              </h2>

              <p className="mt-2 text-slate-500">
                {category.description || t("contribute.noDescription")}
              </p>

              <span className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                {t("categories.openCategory")}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("categories.empty")}
        </div>
      )}
    </main>
  );
}
