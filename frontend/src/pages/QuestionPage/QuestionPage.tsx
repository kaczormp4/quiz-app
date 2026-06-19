import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getQuestion, submitAnswer } from "../../features/quizzes/api";
import type { SubmitAnswerResponse } from "../../features/quizzes/types";

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

export default function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);

  const questionQuery = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestion(questionId!),
    enabled: Boolean(questionId),
  });

  const question = questionQuery.data;

  useEffect(() => {
    setSelectedAnswerId(null);
    setResult(null);
  }, [questionId]);

  const submitAnswerMutation = useMutation({
    mutationFn: (answerId: string) => {
      if (!questionId) {
        throw new Error("Question id is missing");
      }

      return submitAnswer(questionId, {
        answer_id: answerId,
      });
    },
    onSuccess: (response) => {
      setResult(response);
    },
  });

  const handleAnswerClick = (answerId: string) => {
    if (result || submitAnswerMutation.isPending) return;

    setSelectedAnswerId(answerId);
    submitAnswerMutation.mutate(answerId);
  };

  if (!questionId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Question id is missing.
        </div>
      </main>
    );
  }

  if (questionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Loading question...
        </div>
      </main>
    );
  }

  if (questionQuery.isError) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {questionQuery.error instanceof Error
            ? questionQuery.error.message
            : "Question could not be loaded."}
        </div>
      </main>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/quizzes"
        className="text-sm font-semibold text-slate-500 hover:text-slate-950"
      >
        ← Back to categories
      </Link>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {question.difficulty}
          </span>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            {question.points} points
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-950">
          {question.question}
        </h1>

        <div className="mt-6 grid gap-3">
          {question.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            const isCorrectAnswer = result?.correct_answer.id === answer.id;
            const isWrongSelected = result && isSelected && !result.is_correct;

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
              : "Answer could not be checked."}
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p
              className={`mb-3 text-sm font-bold ${
                result.is_correct ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.is_correct ? "Correct answer." : "Incorrect answer."}
            </p>

            <div
              className="prose prose-slate max-w-none text-sm"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(result.explanation_html),
              }}
            />
          </div>
        ) : null}
      </section>

      <QuestionMeta
        createdBy={question.created_by_username}
        approvedBy={question.approved_by_username}
        viewsCount={question.views_count}
      />
    </main>
  );
}

