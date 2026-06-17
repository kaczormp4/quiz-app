export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type CategoryCreatePayload = {
  name: string;
  description: string;
};

export type QuestionSummary = {
  id: string;
  question: string;
  difficulty: string;
  points: number;
  created_by_username?: string | null;
  approved_by_username?: string | null;
  views_count?: number;
  created_at: string;
};

export type Answer = {
  id: string;
  text: string;
  position: number;
};

export type QuestionDetails = {
  id: string;
  question: string;
  difficulty: string;
  points: number;
  created_by_username?: string | null;
  approved_by_username?: string | null;
  views_count?: number;
  explanation_html: string;
  answers: Answer[];
};

export type SubmitAnswerPayload = {
  answer_id: string;
};

export type SubmitAnswerResponse = {
  is_correct: boolean;
  correct_answer: {
    id: string;
    text: string;
  };
  explanation_html: string;
};

export type PendingAnswerCreatePayload = {
  text: string;
  is_correct: boolean;
  position: number;
};

export type PendingQuestionCreatePayload = {
  question: string;
  difficulty: string;
  explanation_html: string;
  points: number;
  created_by_username?: string | null;
  approved_by_username?: string | null;
  views_count?: number;
  answers: PendingAnswerCreatePayload[];
};

export type PendingAnswer = {
  id: string;
  text: string;
  is_correct: boolean;
  position: number;
};

export type PendingQuestion = {
  id: string;
  category_id: string;
  category_name: string;
  submitted_by_username: string | null;
  question: string;
  difficulty: string;
  explanation_html: string;
  points: number;
  created_by_username?: string | null;
  approved_by_username?: string | null;
  views_count?: number;
  status: string;
  created_at: string;
  answers: PendingAnswer[];
};

export type MessageResponse = {
  message: string;
};
