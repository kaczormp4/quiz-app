export type User = {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  created_at: string;
};

export type RankingUser = {
  id: string;
  username: string;
  role: string;
  points: number;
  current_streak: number;
  longest_streak: number;
  linkedin_url: string | null;
  created_at: string;
};

export type WrongAnswerReviewItem = {
  id: string;
  question_id: string;
  question: string;
  difficulty: string;
  explanation_html: string;
  category_slug: string;
  category_name: string;
  created_at: string;
};

export type AnswerHistoryItem = {
  id: string;
  question_id: string;
  question: string;
  selected_answer_id: string;
  selected_answer_text: string;
  is_correct: boolean;
  category_slug: string;
  category_name: string;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  login: string;
  password: string;
};

export type UpdateProfilePayload = {
  username: string;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type WrongAnswerCreatePayload = {
  question_id: string;
};

export type UserAnswerCreatePayload = {
  question_id: string;
  selected_answer_id: string;
  is_correct: boolean;
};

export type MessageResponse = {
  message: string;
};

export type UserAnswerResponse = {
  message: string;
  user: User;
};
