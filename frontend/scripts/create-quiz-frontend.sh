#!/usr/bin/env bash

set -euo pipefail

mkdir -p src/app/providers
mkdir -p src/pages
mkdir -p src/features/quizzes
mkdir -p src/shared/api
mkdir -p src/shared/ui
mkdir -p src/shared/lib

cat > .env <<'FILE'
VITE_API_URL=http://localhost:8000
FILE

cat > .env.example <<'FILE'
VITE_API_URL=http://localhost:8000
FILE

cat > src/shared/api/client.ts <<'FILE'
const API_URL = import.meta.env.VITE_API_URL;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiClientOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
};

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);

    throw new Error(
      errorPayload?.detail ?? `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}
FILE

cat > src/app/providers/QueryProvider.tsx <<'FILE'
import { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
FILE

cat > src/features/quizzes/types.ts <<'FILE'
export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type QuestionListItem = {
  id: string;
  category_id: string;
  question: string;
  difficulty: "easy" | "medium" | "hard" | "expert" | string;
  points: number;
};

export type Answer = {
  id: string;
  text: string;
  position: number;
};

export type QuestionDetails = {
  id: string;
  category_id: string;
  question: string;
  difficulty: string;
  points: number;
  answers: Answer[];
};

export type SubmitAnswerResponse = {
  is_correct: boolean;
  correct_answer: {
    id: string;
    text: string;
  };
  explanation_html: string;
};
FILE

cat > src/features/quizzes/api.ts <<'FILE'
import { apiClient } from "../../shared/api/client";
import type {
  Category,
  QuestionDetails,
  QuestionListItem,
  SubmitAnswerResponse,
} from "./types";

export function getCategories() {
  return apiClient<Category[]>("/quizzes/categories");
}

export function getCategoryQuestions(slug: string) {
  return apiClient<QuestionListItem[]>(
    `/quizzes/categories/${slug}/questions`,
  );
}

export function getQuestion(questionId: string) {
  return apiClient<QuestionDetails>(`/quizzes/questions/${questionId}`);
}

export function submitAnswer(params: {
  questionId: string;
  answerId: string;
}) {
  return apiClient<SubmitAnswerResponse>(
    `/quizzes/questions/${params.questionId}/answer`,
    {
      method: "POST",
      body: {
        answer_id: params.answerId,
      },
    },
  );
}
FILE

cat > src/App.tsx <<'FILE'
export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
          Quiz App
        </p>

        <h1 className="text-5xl font-bold tracking-tight">
          Frontend działa
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Tailwind jest podpięty. Następny krok: podłączymy routing i widoki quizu.
        </p>
      </section>
    </main>
  );
}
FILE

cat > src/main.tsx <<'FILE'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { QueryProvider } from "./app/providers/QueryProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);
FILE

echo "Quiz frontend base generated."
