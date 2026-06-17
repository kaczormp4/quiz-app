export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type QuestionSummary = {
  id: string;
  question: string;
  difficulty: string;
  points: number;
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
