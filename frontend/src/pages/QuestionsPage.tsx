import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import { useBillingAccess } from "../features/billing/hooks";
import {
  addWrongAnswerRequest,
  recordAnswerRequest,
} from "../features/auth/api";
import {
  getCategoryQuestions,
  getQuestion,
  submitAnswer,
} from "../features/quizzes/api";
import type { SubmitAnswerResponse } from "../features/quizzes/types";
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

export default function QuestionsPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { token, setUser } = useAuth();
  const billingAccess = useBillingAccess();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);

  const questionsQuery = useQuery({
    queryKey: ["category-questions", slug],
    queryFn: () => getCategoryQuestions(slug!),
    enabled: Boolean(slug),
  });

  const questions = questionsQuery.data ?? [];
  const currentQuestionSummary = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const questionQuery = useQuery({
    queryKey: ["question", currentQuestionSummary?.id],
    queryFn: () => getQuestion(currentQuestionSummary.id),
    enabled: Boolean(currentQuestionSummary?.id),
  });

  const question = questionQuery.data;

  const isDifficultyLocked = question
    ? !billingAccess.isDifficultyAllowed(question.difficulty)
    : false;

  // Free users can solve easy questions.
  // Medium/hard answers are visible, but read-only.
  const canAnswerQuestion = !isDifficultyLocked;

  const canViewExplanation = billingAccess.canViewExplanations;

  const progress = useMemo(() => {
    if (!questions.length) return 0;

    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  useEffect(() => {
    setSelectedAnswerId(null);
    setResult(null);
  }, [currentQuestionSummary?.id]);

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
          // Recording answer should not block quiz flow.
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
    if (!canAnswerQuestion) return;
    if (result || submitAnswerMutation.isPending) return;

    setSelectedAnswerId(answerId);
    submitAnswerMutation.mutate(answerId);
  };

  if (!slug) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {t("questions.missingSlug")}
        </div>
      </main>
    );
  }

  if (questionsQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("questions.loadingQuestions")}
        </div>
      </main>
    );
  }

  if (questionsQuery.isError) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {questionsQuery.error instanceof Error
            ? questionsQuery.error.message
            : t("questions.loadError")}
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("questions.noQuestions")}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/quizzes"
          className="text-sm font-semibold text-slate-500 hover:text-slate-950"
        >
          ← {t("questions.backToCategories")}
        </Link>

        <span className="text-sm font-semibold text-slate-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-950 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                {question.difficulty}
              </span>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                {t("questions.answerReward")}
              </span>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {t("questions.streakInfo")}
              </span>

              {isDifficultyLocked ? (
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                  Pro
                </span>
              ) : null}
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
                    disabled={
                      Boolean(result) ||
                      submitAnswerMutation.isPending ||
                      !canAnswerQuestion
                    }
                    className={`rounded-2xl border px-4 py-4 text-left font-medium transition ${
                      isCorrectAnswer
                        ? "border-green-400 bg-green-50 text-green-800"
                        : isWrongSelected
                          ? "border-red-400 bg-red-50 text-red-800"
                          : isSelected
                            ? "border-slate-950 bg-slate-100 text-slate-950"
                            : !canAnswerQuestion
                              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {answer.text}
                  </button>
                );
              })}
            </div>

            {!canAnswerQuestion ? (
              <div className="mt-6">
                <LockedFeaturePreview
                  title={t("access.unlockDifficultyTitle")}
                  description={t("access.unlockDifficultyDescription")}
                >
                  <div className="prose prose-slate max-w-none rounded-2xl bg-white p-5 text-sm">
                    <h3>Solution preview</h3>
                    <p>
                      This section explains how to reason about the question,
                      which answer is correct, and how to explain it during a
                      real technical interview.
                    </p>
                    <p>
                      It also highlights common mistakes and what interviewers
                      usually expect from a strong answer.
                    </p>
                  </div>
                </LockedFeaturePreview>
              </div>
            ) : null}

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

                {canViewExplanation ? (
                  <div
                    className="prose prose-slate max-w-none text-sm"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(result.explanation_html),
                    }}
                  />
                ) : (
                  <LockedFeaturePreview
                    title={t("access.unlockExplanationTitle")}
                    description={t("access.unlockExplanationDescription")}
                  >
                    <div className="prose prose-slate max-w-none rounded-2xl bg-white p-5 text-sm">
                      <h3>Detailed explanation preview</h3>
                      <p>
                        This section explains why the correct answer works,
                        what mistakes to avoid, and how to answer this topic
                        during a real technical interview.
                      </p>
                      <p>
                        Upgrade to Pro to unlock full explanations for every
                        question.
                      </p>
                    </div>
                  </LockedFeaturePreview>
                )}
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
          onClick={() => setCurrentIndex((previous) => Math.max(previous - 1, 0))}
          disabled={currentIndex === 0}
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("common.previous")}
        </button>

        {isLastQuestion ? (
          <Link
            to="/quizzes"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {t("questions.backToCategoriesButton")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((previous) =>
                Math.min(previous + 1, questions.length - 1),
              )
            }
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {t("common.next")}
          </button>
        )}
      </div>
    </main>
  );
}
