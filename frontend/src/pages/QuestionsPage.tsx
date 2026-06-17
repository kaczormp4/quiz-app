import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getCategoryQuestions,
  getQuestion,
  submitAnswer,
} from "../features/quizzes/api";
import type { SubmitAnswerResponse } from "../features/quizzes/types";

export function QuestionsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);

  const questionsQuery = useQuery({
    queryKey: ["category-questions", slug],
    queryFn: () => getCategoryQuestions(slug ?? ""),
    enabled: Boolean(slug),
  });

  const questions = questionsQuery.data ?? [];
  const currentQuestionListItem = questions[currentIndex];

  const questionQuery = useQuery({
    queryKey: ["question", currentQuestionListItem?.id],
    queryFn: () => getQuestion(currentQuestionListItem.id),
    enabled: Boolean(currentQuestionListItem?.id),
  });

  const submitAnswerMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: setResult,
  });

  const progress = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  const sanitizedExplanation = useMemo(() => {
    if (!result?.explanation_html) return "";

    return DOMPurify.sanitize(result.explanation_html);
  }, [result?.explanation_html]);

  const resetAnswerState = () => {
    setSelectedAnswerId(null);
    setResult(null);
    submitAnswerMutation.reset();
  };

  const handleAnswerClick = (answerId: string) => {
    if (!currentQuestionListItem?.id || result || submitAnswerMutation.isPending) {
      return;
    }

    setSelectedAnswerId(answerId);

    submitAnswerMutation.mutate({
      questionId: currentQuestionListItem.id,
      answerId,
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex >= questions.length - 1) return;

    setCurrentIndex((index) => index + 1);
    resetAnswerState();
  };

  const handlePreviousQuestion = () => {
    if (currentIndex <= 0) return;

    setCurrentIndex((index) => index - 1);
    resetAnswerState();
  };

  if (questionsQuery.isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="text-slate-500">Loading questions...</p>
        </section>
      </main>
    );
  }

  if (questionsQuery.isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="font-semibold text-red-600">
            {questionsQuery.error.message}
          </p>
        </section>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <Link to="/" className="font-bold text-blue-600">
            ← Kategorie
          </Link>

          <p className="mt-10 text-slate-600">Brak pytań w tej kategorii.</p>
        </section>
      </main>
    );
  }

  const question = questionQuery.data;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <Link to="/" className="font-bold text-blue-600">
          ← Kategorie
        </Link>

        <header className="my-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
            Quiz slider
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">{slug}</h1>

              <p className="mt-4 text-lg text-slate-600">
                Pytanie {currentIndex + 1} z {questions.length}
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
              Progress: {progress}%
            </div>
          </div>

          <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {questionQuery.isLoading && (
            <p className="text-slate-500">Loading question...</p>
          )}

          {questionQuery.isError && (
            <p className="font-semibold text-red-600">
              {questionQuery.error.message}
            </p>
          )}

          {question && (
            <>
              <header className="mb-8">
                <div className="mb-5 flex gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {question.difficulty}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {question.points} pkt
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  {question.question}
                </h2>
              </header>

              <section className="grid gap-3">
                {question.answers.map((answer) => {
                  const isSelected = selectedAnswerId === answer.id;
                  const isCorrectAnswer = result?.correct_answer.id === answer.id;
                  const isWrongSelected =
                    result && isSelected && !result.is_correct;

                  return (
                    <button
                      key={answer.id}
                      type="button"
                      disabled={
                        Boolean(result) || submitAnswerMutation.isPending
                      }
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
                  <h3 className="text-2xl font-bold text-slate-950">
                    {result.is_correct ? "Dobra odpowiedź" : "Zła odpowiedź"}
                  </h3>

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

              <footer className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={handlePreviousQuestion}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Poprzednie
                </button>

                <div className="flex gap-2">
                  {questions.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(index);
                        resetAnswerState();
                      }}
                      className={[
                        "h-3 w-3 rounded-full transition",
                        index === currentIndex ? "bg-blue-600" : "bg-slate-300",
                      ].join(" ")}
                      aria-label={`Przejdź do pytania ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentIndex === questions.length - 1}
                  onClick={handleNextQuestion}
                  className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Następne
                </button>
              </footer>
            </>
          )}
        </article>
      </section>
    </main>
  );
}

export default QuestionsPage;
