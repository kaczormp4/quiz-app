export type User = {
  id: string;
  email: string;
  username: string;
  points: number;
  linkedin_url: string | null;
  created_at: string;
};

export type RankingUser = {
  id: string;
  username: string;
  points: number;
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
  linkedin_url: string | null;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type WrongAnswerCreatePayload = {
  question_id: string;
};

export type MessageResponse = {
  message: string;
};
