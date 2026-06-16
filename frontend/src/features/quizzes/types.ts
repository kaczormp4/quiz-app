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
