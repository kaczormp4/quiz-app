import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import { useBillingAccess } from "../features/billing/hooks";
import { LockedFeaturePreview } from "../shared/ui/LockedFeaturePreview";

function QuestionMeta({
  createdBy,
  approvedBy,
  viewsCount,
}: {
  createdBy?: string | null;
  approvedBy?: string | null;
  viewsCount?: number;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-2 text-[11px] text-slate-400">
      <span>Created by: {createdBy ?? "System"}</span>
      <span>Approved by: {approvedBy ?? "System"}</span>
      <span>Views: {viewsCount ?? 0}</span>
    </div>
  );
}
import {
  addWrongAnswerRequest,
  getWrongAnswersRequest,
  recordAnswerRequest,
} from "../features/auth/api";
import { getQuestion, submitAnswer } from "../features/quizzes/api";
import type { SubmitAnswerResponse } from "../features/quizzes/types";

export default function ReviewPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { token, setUser } = useAuth();
  const billingAccess = useBillingAccess();

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);

  const wrongAnswersQuery = useQuery({
    queryKey: ["wrong-answers"],
    queryFn: () => getWrongAnswersRequest(token!),
    enabled: Boolean(token),
  });

  const reviewItems = useMemo(() => {
    const items = wrongAnswersQuery.data ?? [];
    const uniqueByQuestionId = new Map<string, (typeof items)[number]>();

    for (const item of items) {
      uniqueByQuestionId.set(item.question_id, item);
    }

    return Array.from(uniqueByQuestionId.values());
  }, [wrongAnswersQuery.data]);

  const currentReviewItem =
    currentIndex !== null ? reviewItems[currentIndex] : null;

  const questionQuery = useQuery({
    queryKey: ["review-question", currentReviewItem?.question_id],
    queryFn: () => getQuestion(currentReviewItem!.question_id),
    enabled: Boolean(currentReviewItem?.question_id),
  });

  const question = questionQuery.data;

  const progress = useMemo(() => {
    if (!reviewItems.length || currentIndex === null) return 0;

    return Math.round(((currentIndex + 1) / reviewItems.length) * 100);
  }, [currentIndex, reviewItems.length]);

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion =
    currentIndex !== null && currentIndex === reviewItems.length - 1;

  useEffect(() => {
    setSelectedAnswerId(null);
    setResult(null);
  }, [currentReviewItem?.question_id]);

  const submitAnswerMutation = useMutation({
    mutationFn: (answerId: string) => {
      if (!question) {
        throw new Error("Question is not loaded");
      }

      return submitAnswer(question.id, {
        answer_id: answerId,
      });
    },
    onSuccess: async (response, answerId) => {
      setResult(response);

      if (token && question) {
        try {
          const recordResponse = await recordAnswerRequest(
            {
              question_id: question.id,
              selected_answer_id: answerId,
              is_correct: response.is_correct,
            },
            token,
          );

          setUser(recordResponse.user);

          await queryClient.invalidateQueries({ queryKey: ["ranking"] });
          await queryClient.invalidateQueries({ queryKey: ["answer-history"] });
        } catch {
          // Recording answer should not block review flow.
        }
      }

      if (!response.is_correct && question && token) {
        await addWrongAnswerRequest(
          {
            question_id: question.id,
          },
          token,
        );

        await queryClient.invalidateQueries({ queryKey: ["wrong-answers"] });
      }
    },
  });

  const handleAnswerClick = (answerId: string) => {
    if (result || submitAnswerMutation.isPending) return;

    setSelectedAnswerId(answerId);
    submitAnswerMutation.mutate(answerId);
  };

  const openSliderAt = (index: number) => {
    setCurrentIndex(index);
  };

  const backToList = () => {
    setCurrentIndex(null);
    setSelectedAnswerId(null);
    setResult(null);
  };

  const goToPrevious = () => {
    if (currentIndex === null) return;

    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };

  const goToNext = () => {
    if (currentIndex === null) return;

    setCurrentIndex(Math.min(currentIndex + 1, reviewItems.length - 1));
  };

  if (!billingAccess.isLoading && !billingAccess.canUseReview) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LockedFeaturePreview
          title={t("access.unlockReviewTitle")}
          description={t("access.unlockReviewDescription")}
        >
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {[
                "React reconciliation and keys",
                "JavaScript event loop",
                "HTTP authentication flow",
                "Database transactions",
              ].map((title) => (
                <div
                  key={title}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-slate-950">
                    {title}
                  </span>
                  <span className="text-xl text-slate-300">?</span>
                </div>
              ))}
            </div>
          </div>
        </LockedFeaturePreview>
      </main>
    );
  }

  if (wrongAnswersQuery.isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("review.loading")}
        </div>
      </main>
    );
  }

  if (wrongAnswersQuery.isError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {wrongAnswersQuery.error instanceof Error
            ? wrongAnswersQuery.error.message
            : t("review.loadError")}
        </div>
      </main>
    );
  }

  if (!reviewItems.length) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950">
            {t("review.title")}
          </h1>
          <p className="mt-2 text-slate-500">{t("review.subtitle")}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("review.empty")}
        </div>
      </main>
    );
  }

  if (currentIndex !== null && currentReviewItem) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={backToList}
            className="text-left text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            ← {t("review.backToReviewList")}
          </button>

          <span className="text-sm font-semibold text-slate-500">
            {currentIndex + 1} / {reviewItems.length}
          </span>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-950 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {t("review.reviewMode")}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {t("review.onlyReviewQuestions")}
            </p>
          </div>

          {questionQuery.isLoading ? (
            <div className="text-slate-500">{t("questions.loadingQuestion")}</div>
          ) : questionQuery.isError ? (
            <div className="text-red-600">
              {questionQuery.error instanceof Error
                ? questionQuery.error.message
                : t("questions.questionLoadError")}
            </div>
          ) : question ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {currentReviewItem.category_name}
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {question.difficulty}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-950">
                {question.question}
              </h1>

              <div className="mt-6 grid gap-3">
                {question.answers.map((answer) => {
                  const isSelected = selectedAnswerId === answer.id;
                  const isCorrectAnswer = result?.correct_answer.id === answer.id;
                  const isWrongSelected =
                    result && isSelected && !result.is_correct;

                  return (
                    <button
                      key={answer.id}
                      type="button"
                      onClick={() => handleAnswerClick(answer.id)}
                      disabled={Boolean(result) || submitAnswerMutation.isPending}
                      className={`rounded-2xl border px-4 py-4 text-left font-medium transition ${
                        isCorrectAnswer
                          ? "border-green-400 bg-green-50 text-green-800"
                          : isWrongSelected
                            ? "border-red-400 bg-red-50 text-red-800"
                            : isSelected
                              ? "border-slate-950 bg-slate-100 text-slate-950"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {answer.text}
                    </button>
                  );
                })}
              </div>

              {submitAnswerMutation.isError ? (
                <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {submitAnswerMutation.error instanceof Error
                    ? submitAnswerMutation.error.message
                    : t("questions.answerCheckError")}
                </div>
              ) : null}

              {result ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p
                    className={`mb-3 text-sm font-bold ${
                      result.is_correct ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.is_correct
                      ? t("questions.correctMessage")
                      : t("questions.incorrectMessage")}
                  </p>

                  <div
                    className="prose prose-slate max-w-none text-sm"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(result.explanation_html),
                    }}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        {question ? (
          <QuestionMeta
            createdBy={question.created_by_username}
            approvedBy={question.approved_by_username}
            viewsCount={question.views_count}
          />
        ) : null}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={isFirstQuestion}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.previous")}
          </button>

          <button
            type="button"
            onClick={goToNext}
            disabled={isLastQuestion}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.next")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">
          {t("review.title")}
        </h1>

        <p className="mt-2 text-slate-500">
          {t("review.subtitle")}
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {reviewItems.map((item, index) => (
            <button
              key={item.question_id}
              type="button"
              onClick={() => openSliderAt(index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-950">
                {item.question}
              </span>

              <span className="text-xl text-slate-300">→</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
