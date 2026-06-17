export type User = {
  id: string;
  email: string;
  username: string;
  points: number;
  created_at: string;
};

export type RankingUser = {
  id: string;
  username: string;
  points: number;
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
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type MessageResponse = {
  message: string;
};
