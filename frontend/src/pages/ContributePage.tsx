import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../app/providers/AuthProvider";
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
  const queryClient = useQueryClient();
  const { token } = useAuth();

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
      setMessage("Kategoria została dodana.");
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
      setMessage("Pytanie zostało wysłane do akceptacji administratora.");
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">Dodaj pytania</h1>
        <p className="mt-2 text-slate-500">
          Najpierw wybierz istniejącą kategorię albo dodaj nową. Pytania trafią do kolejki administratora.
        </p>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Kategorie</h2>

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
                <p className="text-sm opacity-75">{category.description || "Brak opisu"}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateCategory} className="mt-6 space-y-3">
            <h3 className="font-bold text-slate-950">Dodaj nową kategorię</h3>

            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder="Nazwa kategorii"
              required
            />

            <textarea
              value={newCategoryDescription}
              onChange={(event) => setNewCategoryDescription(event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder="Opis kategorii"
            />

            {createCategoryMutation.isError ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {createCategoryMutation.error instanceof Error
                  ? createCategoryMutation.error.message
                  : "Nie udało się dodać kategorii"}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createCategoryMutation.isPending ? "Dodawanie..." : "Dodaj kategorię"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Nowe pytanie {selectedCategory ? `do: ${selectedCategory.name}` : ""}
          </h2>

          {!selectedCategoryId ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-slate-500">
              Wybierz kategorię po lewej stronie.
            </div>
          ) : (
            <form onSubmit={handleSubmitQuestion} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Treść pytania</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="mt-1 min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Difficulty</span>
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
                  <span className="text-sm font-semibold text-slate-700">Punkty</span>
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
                <h3 className="font-bold text-slate-950">Odpowiedzi — dokładnie 4</h3>

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
                      placeholder={`Odpowiedź ${answer.position}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Explanation HTML
                </span>
                <textarea
                  value={explanationHtml}
                  onChange={(event) => setExplanationHtml(event.target.value)}
                  className="mt-1 min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-slate-950"
                  placeholder="<p>Wyjaśnienie odpowiedzi...</p>"
                  required
                />
              </label>

              {submitQuestionMutation.isError ? (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {submitQuestionMutation.error instanceof Error
                    ? submitQuestionMutation.error.message
                    : "Nie udało się wysłać pytania"}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitQuestionMutation.isPending}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitQuestionMutation.isPending ? "Wysyłanie..." : "Wyślij do akceptacji"}
              </button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Moje pytania w kolejce</h2>

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
            <p className="text-slate-500">Nie masz jeszcze pytań w kolejce.</p>
          )}
        </div>
      </section>
    </main>
  );
}
