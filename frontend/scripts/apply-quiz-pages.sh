#!/usr/bin/env bash

set -euo pipefail

cat > src/pages/CategoriesPage.tsx <<'FILE'
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../features/quizzes/api";

export function CategoriesPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="text-slate-500">Loading categories...</p>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="font-semibold text-red-600">{error.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
            Quiz App
          </p>

          <h1 className="text-5xl font-bold tracking-tight">Kategorie</h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Wybierz kategorię i rozpocznij quiz.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {data?.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl"
            >
              <h2 className="text-2xl font-bold text-slate-950">
                {category.name}
              </h2>

              <p className="mt-3 text-slate-600">{category.description}</p>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
FILE

cat > src/pages/QuestionsPage.tsx <<'FILE'
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCategoryQuestions } from "../features/quizzes/api";

export function QuestionsPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["category-questions", slug],
    queryFn: () => getCategoryQuestions(slug ?? ""),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="text-slate-500">Loading questions...</p>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <p className="font-semibold text-red-600">{error.message}</p>
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

        <header className="my-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
            Kategoria
          </p>

          <h1 className="text-5xl font-bold tracking-tight">{slug}</h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Wybierz pytanie i sprawdź odpowiedź.
          </p>
        </header>

        <section className="grid gap-4">
          {data?.map((question, index) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                    Pytanie {index + 1}
                  </p>

                  <h2 className="text-xl font-bold text-slate-950">
                    {question.question}
                  </h2>
                </div>

                <div className="flex shrink-0 gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {question.difficulty}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {question.points} pkt
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
FILE

cat > src/pages/QuestionPage.tsx <<'FILE'
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
FILE

cat > src/App.tsx <<'FILE'
import { Route, Routes } from "react-router-dom";

import { CategoriesPage } from "./pages/CategoriesPage";
import { QuestionPage } from "./pages/QuestionPage";
import { QuestionsPage } from "./pages/QuestionsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CategoriesPage />} />
      <Route path="/categories/:slug" element={<QuestionsPage />} />
      <Route path="/questions/:questionId" element={<QuestionPage />} />
    </Routes>
  );
}
FILE

cat > src/main.tsx <<'FILE'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { QueryProvider } from "./app/providers/QueryProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>,
);
FILE

echo "Quiz pages applied."
