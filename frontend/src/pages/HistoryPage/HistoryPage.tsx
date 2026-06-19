import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../app/providers/AuthProvider";
import { useBillingAccess } from "../../features/billing/hooks";
import { LockedFeaturePreview } from "../../shared/ui/LockedFeaturePreview";
import { getAnswerHistoryRequest } from "../../features/auth/api";

export default function HistoryPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const billingAccess = useBillingAccess();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["answer-history"],
    queryFn: () => getAnswerHistoryRequest(token!),
    enabled: Boolean(token),
  });

  if (!billingAccess.isLoading && !billingAccess.canUseReview) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LockedFeaturePreview
          title={t("access.unlockHistoryTitle")}
          description={t("access.unlockHistoryDescription")}
        >
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Question</th>
                    <th className="px-6 py-3">Selected answer</th>
                    <th className="px-6 py-3">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    "React reconciliation",
                    "JavaScript event loop",
                    "HTTP authentication",
                  ].map((item) => (
                    <tr key={item}>
                      <td className="px-6 py-4">Correct</td>
                      <td className="px-6 py-4">{item}</td>
                      <td className="px-6 py-4">Example answer</td>
                      <td className="px-6 py-4">Frontend</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </LockedFeaturePreview>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">{t("history.title")}</h1>
        <p className="mt-2 text-slate-500">{t("history.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("history.loading")}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error instanceof Error ? error.message : t("history.loadError")}
        </div>
      ) : data && data.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-3">{t("common.status")}</th>
                  <th className="px-6 py-3">{t("common.question")}</th>
                  <th className="px-6 py-3">{t("history.selectedAnswer")}</th>
                  <th className="px-6 py-3">{t("common.category")}</th>
                  <th className="px-6 py-3">{t("common.actions")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      {item.is_correct ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {t("common.correct")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          {t("common.incorrect")}
                        </span>
                      )}
                    </td>

                    <td className="max-w-md px-6 py-4 font-medium text-slate-950">
                      {item.question}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.selected_answer_text}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.category_name}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        to={`/questions/${item.question_id}`}
                        className="text-sm font-semibold text-slate-950 hover:underline"
                      >
                        {t("common.open")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("history.empty")}
        </div>
      )}
    </main>
  );
}

