import DOMPurify from "dompurify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import {
  approvePendingQuestionRequest,
  getAdminPendingQuestionsRequest,
  rejectPendingQuestionRequest,
} from "../features/quizzes/api";

export default function AdminPendingQuestionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { token, user } = useAuth();

  const pendingQuery = useQuery({
    queryKey: ["admin-pending-questions"],
    queryFn: () => getAdminPendingQuestionsRequest(token!),
    enabled: Boolean(token && user?.role === "admin"),
  });

  const approveMutation = useMutation({
    mutationFn: (pendingQuestionId: string) =>
      approvePendingQuestionRequest(pendingQuestionId, token!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-pending-questions"] });
      await queryClient.invalidateQueries({ queryKey: ["ranking"] });
      await queryClient.invalidateQueries({ queryKey: ["category-questions"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (pendingQuestionId: string) =>
      rejectPendingQuestionRequest(pendingQuestionId, token!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-pending-questions"] });
    },
  });

  if (user?.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {t("adminPanel.noAccess")}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">{t("adminPanel.title")}</h1>
        <p className="mt-2 text-slate-500">{t("adminPanel.subtitle")}</p>
      </div>

      {pendingQuery.isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500">
          {t("adminPanel.loading")}
        </div>
      ) : pendingQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {pendingQuery.error instanceof Error
            ? pendingQuery.error.message
            : t("adminPanel.loadError")}
        </div>
      ) : pendingQuery.data && pendingQuery.data.length > 0 ? (
        <div className="grid gap-5">
          {pendingQuery.data.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {item.category_name}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  {item.difficulty}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {t("adminPanel.author")}: {item.submitted_by_username ?? t("common.unknown")}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-950">{item.question}</h2>

              <div className="mt-4 grid gap-2">
                {item.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`rounded-2xl border px-4 py-3 ${
                      answer.is_correct
                        ? "border-green-300 bg-green-50 text-green-800"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {answer.position}. {answer.text}
                    {answer.is_correct ? " ✅" : ""}
                  </div>
                ))}
              </div>

              <div
                className="prose prose-slate mt-5 max-w-none rounded-2xl bg-slate-50 p-4 text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item.explanation_html),
                }}
              />

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => approveMutation.mutate(item.id)}
                  disabled={approveMutation.isPending}
                  className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {t("adminPanel.approve")}
                </button>

                <button
                  type="button"
                  onClick={() => rejectMutation.mutate(item.id)}
                  disabled={rejectMutation.isPending}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {t("adminPanel.reject")}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500">
          {t("adminPanel.empty")}
        </div>
      )}
    </main>
  );
}
