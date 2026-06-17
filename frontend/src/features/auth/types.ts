export type User = {
  id: string;
  email: string;
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
