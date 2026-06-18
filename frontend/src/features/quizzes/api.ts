import { apiClient } from "../../shared/api/client";
import type {
  Category,
  CategoryCreatePayload,
  MessageResponse,
  PendingQuestion,
  PendingQuestionCreatePayload,
  QuestionDetails,
  QuestionSummary,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
} from "./types";

export const getCategories = () => apiClient<Category[]>("/quizzes/categories");

export const createCategoryRequest = (
  payload: CategoryCreatePayload,
  token: string,
) =>
  apiClient<Category>("/quizzes/categories", {
    method: "POST",
    body: payload,
    token,
  });

export const getCategoryQuestions = (slug: string) =>
  apiClient<QuestionSummary[]>(`/quizzes/categories/${slug}/questions`);

export const getQuestion = (questionId: string) =>
  apiClient<QuestionDetails>(`/quizzes/questions/${questionId}`);

export const submitAnswer = (
  questionId: string,
  payload: SubmitAnswerPayload,
) =>
  apiClient<SubmitAnswerResponse>(`/quizzes/questions/${questionId}/answer`, {
    method: "POST",
    body: payload,
  });

export const submitPendingQuestionRequest = (
  categoryId: string,
  payload: PendingQuestionCreatePayload,
  token: string,
) =>
  apiClient<MessageResponse>(`/quizzes/categories/${categoryId}/pending-questions`, {
    method: "POST",
    body: payload,
    token,
  });

export const getMyPendingQuestionsRequest = (token: string) =>
  apiClient<PendingQuestion[]>("/quizzes/my/pending-questions", {
    token,
  });

export const getAdminPendingQuestionsRequest = (token: string) =>
  apiClient<PendingQuestion[]>("/admin/pending-questions", {
    token,
  });

export const approvePendingQuestionRequest = (
  pendingQuestionId: string,
  token: string,
) =>
  apiClient<MessageResponse>(`/admin/pending-questions/${pendingQuestionId}/approve`, {
    method: "POST",
    token,
  });

export const rejectPendingQuestionRequest = (
  pendingQuestionId: string,
  token: string,
) =>
  apiClient<MessageResponse>(`/admin/pending-questions/${pendingQuestionId}/reject`, {
    method: "POST",
    token,
  });


export type AdminQuestionPayloadAnswer = {
  id?: "A" | "B" | "C" | "D";
  text: string;
  is_correct: boolean;
  explanation_html: string;
};

export type AdminQuestionPayload = {
  category_code: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  question_html?: string;
  answers: AdminQuestionPayloadAnswer[];
  tags?: string[];
};

export const importAdminQuestionPayloadRequest = (
  payload: AdminQuestionPayload,
  token: string,
) =>
  apiClient<MessageResponse>("/admin/import-payload", {
    method: "POST",
    body: payload,
    token,
  });

