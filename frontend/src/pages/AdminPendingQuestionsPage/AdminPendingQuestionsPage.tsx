import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../app/providers/AuthProvider";
import {
  approvePendingQuestionRequest,
  getAdminPendingQuestionsRequest,
  importAdminQuestionPayloadRequest,
  rejectPendingQuestionRequest,
} from "../../features/quizzes/api";

export default function AdminPendingQuestionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { token, user } = useAuth();

  const examplePayload = useMemo(
    () =>
      JSON.stringify(
        {
          category_code: "react",
          difficulty: "medium",
          question: "Why should React list items have stable keys?",
          question_html:
            "<p>Why should React list items have <strong>stable keys</strong>?</p>",
          answers: [
            {
              id: "A",
              text: "Because keys help React identify which items changed, were added, or removed.",
              is_correct: true,
              explanation_html:
                "<p><strong>Correct.</strong> React uses keys during reconciliation to match previous and next elements.</p>",
            },
            {
              id: "B",
              text: "Because keys are required for CSS styling.",
              is_correct: false,
              explanation_html:
                "<p><strong>Incorrect.</strong> Keys are not used for CSS styling.</p>",
            },
            {
              id: "C",
              text: "Because keys make components render only once.",
              is_correct: false,
              explanation_html:
                "<p><strong>Incorrect.</strong> Keys do not prevent re-renders.</p>",
            },
            {
              id: "D",
              text: "Because keys replace state management.",
              is_correct: false,
              explanation_html:
                "<p><strong>Incorrect.</strong> Keys do not replace state management.</p>",
            },
          ],
          tags: ["react", "reconciliation", "keys"],
        },
        null,
        2,
      ),
    [],
  );

  const [payloadText, setPayloadText] = useState(examplePayload);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [payloadSuccess, setPayloadSuccess] = useState<string | null>(null);
  const [approveAutomatically, setApproveAutomatically] = useState(false);

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

  const importPayloadMutation = useMutation({
    mutationFn: async () => {
      setPayloadError(null);
      setPayloadSuccess(null);

      if (!token) {
        throw new Error("Missing auth token.");
      }

      let parsedPayload: unknown;

      try {
        parsedPayload = JSON.parse(payloadText);
      } catch {
        throw new Error("Invalid JSON payload.");
      }

      const payloads = Array.isArray(parsedPayload)
        ? parsedPayload
        : [parsedPayload];

      const importedQuestions = [];
      let approvedCount = 0;

      for (const payload of payloads) {
        const importedQuestion = await importAdminQuestionPayloadRequest(
          payload as never,
          token,
        );

        importedQuestions.push(importedQuestion);

        if (approveAutomatically) {
          await approvePendingQuestionRequest(importedQuestion.id, token);
          approvedCount += 1;
        }
      }

      return {
        importedCount: importedQuestions.length,
        approvedCount,
      };
    },
    onSuccess: async (result) => {
      const importedMessage = `Imported ${result.importedCount} question${
        result.importedCount === 1 ? "" : "s"
      }`;

      const approvedMessage = approveAutomatically
        ? ` and approved ${result.approvedCount}`
        : "";

      setPayloadSuccess(`${importedMessage}${approvedMessage} successfully.`);
      setPayloadError(null);

      await queryClient.invalidateQueries({ queryKey: ["admin-pending-questions"] });
      await queryClient.invalidateQueries({ queryKey: ["ranking"] });
      await queryClient.invalidateQueries({ queryKey: ["category-questions"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      setPayloadSuccess(null);
      setPayloadError(error instanceof Error ? error.message : "Import failed.");
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

      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-950">Import question payload</h2>
          <p className="mt-1 text-sm text-slate-500">
            Paste a ready JSON object with category_code, difficulty, question and exactly 4 answers.
          </p>
        </div>

        <textarea
          value={payloadText}
          onChange={(event) => setPayloadText(event.target.value)}
          className="min-h-[420px] w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-sm text-slate-50 outline-none focus:border-blue-500"
          spellCheck={false}
        />

        {payloadError ? (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {payloadError}
          </div>
        ) : null}

        {payloadSuccess ? (
          <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {payloadSuccess}
          </div>
        ) : null}

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={approveAutomatically}
            onChange={(event) => setApproveAutomatically(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span>Approve automatically after import</span>
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => importPayloadMutation.mutate()}
            disabled={importPayloadMutation.isPending}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {importPayloadMutation.isPending ? "Importing..." : "Import payload"}
          </button>

          <button
            type="button"
            onClick={() => {
              setPayloadText(examplePayload);
              setPayloadError(null);
              setPayloadSuccess(null);
              setApproveAutomatically(false);
            }}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset example
          </button>
        </div>
      </section>


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
                    {answer.is_correct ? " âś…" : ""}
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

