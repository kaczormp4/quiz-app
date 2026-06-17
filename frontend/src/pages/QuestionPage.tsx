import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getQuestion, submitAnswer } from "../features/quizzes/api";
import type { SubmitAnswerResponse } from "../features/quizzes/types";

export function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);

  const questionQuery = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestion(questionId ?? ""),
    enabled: Boolean(questionId),
  });

  const submitAnswerMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: setResult,
  });

  const sanitizedExplanation = useMemo(() => {
    if (!result?.explanation_html) return "";

    return DOMPurify.sanitize(result.explanation_html);
  }, [result?.explanation_html]);

  const handleAnswerClick = (answerId: string) => {
    if (!questionId || result || submitAnswerMutation.isPending) return;

    setSelectedAnswerId(answerId);

    submitAnswerMutation.mutate({
      questionId,
      answerId,
    });
  };

  if (questionQuery.isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="text-slate-500">Loading question...</p>
        </section>
      </main>
    );
  }

  if (questionQuery.isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="font-semibold text-red-600">
            {questionQuery.error.message}
          </p>
        </section>
      </main>
    );
  }

  const question = questionQuery.data;

  if (!question) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p>Question not found.</p>
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

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-8">
            <div className="mb-5 flex gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                {question.difficulty}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                {question.points} pkt
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {question.question}
            </h1>
          </header>

          <section className="grid gap-3">
            {question.answers.map((answer) => {
              const isSelected = selectedAnswerId === answer.id;
              const isCorrectAnswer = result?.correct_answer.id === answer.id;
              const isWrongSelected = result && isSelected && !result.is_correct;

              return (
                <button
                  key={answer.id}
                  type="button"
                  disabled={Boolean(result) || submitAnswerMutation.isPending}
                  onClick={() => handleAnswerClick(answer.id)}
                  className={[
                    "w-full rounded-2xl border px-5 py-4 text-left font-semibold transition",
                    "disabled:cursor-not-allowed",
                    !result &&
                      "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
                    isSelected && !result && "border-blue-500 bg-blue-50",
                    result &&
                      isCorrectAnswer &&
                      "border-green-500 bg-green-50 text-green-900",
                    isWrongSelected &&
                      "border-red-500 bg-red-50 text-red-900",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {answer.text}
                </button>
              );
            })}
          </section>

          {submitAnswerMutation.isError && (
            <p className="mt-5 font-semibold text-red-600">
              {submitAnswerMutation.error.message}
            </p>
          )}

          {result && (
            <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-2xl font-bold text-slate-950">
                {result.is_correct ? "Dobra odpowiedź" : "Zła odpowiedź"}
              </h2>

              <p className="mt-3 text-slate-700">
                Poprawna odpowiedź:{" "}
                <strong>{result.correct_answer.text}</strong>
              </p>

              <div
                className="mt-6 max-w-none text-slate-700 [&_code]:rounded [&_code]:bg-slate-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-50"
                dangerouslySetInnerHTML={{
                  __html: sanitizedExplanation,
                }}
              />
            </section>
          )}
        </article>
      </section>
    </main>
  );
}

export default QuestionPage;
