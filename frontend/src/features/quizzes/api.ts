import { apiClient } from "../../shared/api/client";
import type {
  Category,
  QuestionDetails,
  QuestionSummary,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
} from "./types";

export const getCategories = () => apiClient<Category[]>("/quizzes/categories");

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
