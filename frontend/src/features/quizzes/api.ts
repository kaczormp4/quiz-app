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
