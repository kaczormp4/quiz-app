import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import { useBillingAccess } from "../features/billing/hooks";
import { LockedFeaturePreview } from "../shared/ui/LockedFeaturePreview";
import {
  createCategoryRequest,
  getCategories,
  getMyPendingQuestionsRequest,
  submitPendingQuestionRequest,
} from "../features/quizzes/api";
import type { PendingAnswerCreatePayload } from "../features/quizzes/types";

const defaultAnswers: PendingAnswerCreatePayload[] = [
  { text: "", is_correct: true, position: 1 },
  { text: "", is_correct: false, position: 2 },
  { text: "", is_correct: false, position: 3 },
  { text: "", is_correct: false, position: 4 },
];

export default function ContributePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const billingAccess = useBillingAccess();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [points, setPoints] = useState(1);
  const [explanationHtml, setExplanationHtml] = useState("");
  const [answers, setAnswers] = useState<PendingAnswerCreatePayload[]>(defaultAnswers);

  const [message, setMessage] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const myPendingQuery = useQuery({
    queryKey: ["my-pending-questions"],
    queryFn: () => getMyPendingQuestionsRequest(token!),
    enabled: Boolean(token),
  });

  const selectedCategory = useMemo(
    () => categoriesQuery.data?.find((category) => category.id === selectedCategoryId),
    [categoriesQuery.data, selectedCategoryId],
  );

  const createCategoryMutation = useMutation({
    mutationFn: () =>
      createCategoryRequest(
        {
          name: newCategoryName,
          description: newCategoryDescription,
        },
        token!,
      ),
    onSuccess: async (category) => {
      setMessage(t("contribute.categoryAdded"));
      setNewCategoryName("");
      setNewCategoryDescription("");
      setSelectedCategoryId(category.id);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const submitQuestionMutation = useMutation({
    mutationFn: () =>
      submitPendingQuestionRequest(
        selectedCategoryId,
        {
          question,
          difficulty,
          points,
          explanation_html: explanationHtml,
          answers,
        },
        token!,
      ),
    onSuccess: async () => {
      setMessage(t("contribute.sentForApproval"));
      setQuestion("");
      setDifficulty("easy");
      setPoints(1);
      setExplanationHtml("");
      setAnswers(defaultAnswers);

      await queryClient.invalidateQueries({ queryKey: ["my-pending-questions"] });
    },
  });

  const handleCreateCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    createCategoryMutation.mutate();
  };

  const handleSubmitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    submitQuestionMutation.mutate();
  };

  const updateAnswerText = (position: number, text: string) => {
    setAnswers((current) =>
      current.map((answer) =>
        answer.position === position ? { ...answer, text } : answer,
      ),
    );
  };

  const markCorrectAnswer = (position: number) => {
    setAnswers((current) =>
      current.map((answer) => ({
        ...answer,
        is_correct: answer.position === position,
      })),
    );
  };

  if (!billingAccess.isLoading && !billingAccess.canSubmitQuestions) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LockedFeaturePreview
          title={t("access.unlockContributeTitle")}
          description={t("access.unlockContributeDescription")}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Categories</h2>

              <div className="mt-4 grid gap-2">
                <div className="rounded-2xl border border-slate-200 px-4 py-3">
                  <p className="font-semibold">Frontend Interview</p>
                  <p className="text-sm text-slate-500">React, JavaScript and browser topics</p>
                </div>
                <div className="rounded-2xl border border-slate-200 px-4 py-3">
                  <p className="font-semibold">General Computer Science</p>
                  <p className="text-sm text-slate-500">Algorithms, HTTP, Git and databases</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Submit question preview</h2>

              <div className="mt-6 space-y-4">
                <div className="h-24 rounded-2xl border border-slate-300 bg-slate-50" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-12 rounded-2xl border border-slate-300 bg-slate-50" />
                  <div className="h-12 rounded-2xl border border-slate-300 bg-slate-50" />
                </div>
                <div className="grid gap-3">
                  <div className="h-12 rounded-2xl border border-slate-300 bg-slate-50" />
                  <div className="h-12 rounded-2xl border border-slate-300 bg-slate-50" />
                  <div className="h-12 rounded-2xl border border-slate-300 bg-slate-50" />
                  <div className="h-12 rounded-2xl border border-slate-300 bg-slate-50" />
                </div>
              </div>
            </section>
          </div>
        </LockedFeaturePreview>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">{t("contribute.title")}</h1>
        <p className="mt-2 text-slate-500">{t("contribute.subtitle")}</p>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">{t("contribute.categories")}</h2>

          <div className="mt-4 grid gap-2">
            {categoriesQuery.data?.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  selectedCategoryId === category.id
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                <p className="font-semibold">{category.name}</p>
                <p className="text-sm opacity-75">{category.description || t("contribute.noDescription")}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateCategory} className="mt-6 space-y-3">
            <h3 className="font-bold text-slate-950">{t("contribute.addNewCategory")}</h3>

            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder={t("contribute.categoryName")}
              required
            />

            <textarea
              value={newCategoryDescription}
              onChange={(event) => setNewCategoryDescription(event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder={t("contribute.categoryDescription")}
            />

            {createCategoryMutation.isError ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {createCategoryMutation.error instanceof Error
                  ? createCategoryMutation.error.message
                  : t("contribute.categoryError")}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createCategoryMutation.isPending ? t("contribute.addingCategory") : t("contribute.addCategory")}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            {selectedCategory
              ? t("contribute.newQuestionFor", { category: selectedCategory.name })
              : t("contribute.newQuestion")}
          </h2>

          {!selectedCategoryId ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-slate-500">
              {t("contribute.chooseCategory")}
            </div>
          ) : (
            <form onSubmit={handleSubmitQuestion} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">{t("contribute.questionText")}</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="mt-1 min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">{t("common.difficulty")}</span>
                  <select
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">{t("common.points")}</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={points}
                    onChange={(event) => setPoints(Number(event.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-950">{t("contribute.exactAnswers")}</h3>

                {answers.map((answer) => (
                  <div key={answer.position} className="flex gap-3">
                    <input
                      type="radio"
                      checked={answer.is_correct}
                      onChange={() => markCorrectAnswer(answer.position)}
                      name="correctAnswer"
                      className="mt-4"
                    />

                    <input
                      value={answer.text}
                      onChange={(event) => updateAnswerText(answer.position, event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                      placeholder={t("contribute.answerPlaceholder", { position: answer.position })}
                      required
                    />
                  </div>
                ))}
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  {t("contribute.explanationHtml")}
                </span>
                <textarea
                  value={explanationHtml}
                  onChange={(event) => setExplanationHtml(event.target.value)}
                  className="mt-1 min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-slate-950"
                  placeholder={t("contribute.explanationPlaceholder")}
                  required
                />
              </label>

              {submitQuestionMutation.isError ? (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {submitQuestionMutation.error instanceof Error
                    ? submitQuestionMutation.error.message
                    : t("contribute.submitError")}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitQuestionMutation.isPending}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitQuestionMutation.isPending ? t("contribute.sending") : t("contribute.sendForApproval")}
              </button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">{t("contribute.myPending")}</h2>

        <div className="mt-4 grid gap-3">
          {myPendingQuery.data && myPendingQuery.data.length > 0 ? (
            myPendingQuery.data.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-2 flex gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {item.category_name}
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {item.status}
                  </span>
                </div>

                <p className="font-semibold text-slate-950">{item.question}</p>
              </article>
            ))
          ) : (
            <p className="text-slate-500">{t("contribute.noPending")}</p>
          )}
        </div>
      </section>
    </main>
  );
}
