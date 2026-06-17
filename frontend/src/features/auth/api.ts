import { apiClient } from "../../shared/api/client";
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  MessageResponse,
  RankingUser,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "./types";

export const registerRequest = (payload: RegisterPayload) =>
  apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });

export const loginRequest = (payload: LoginPayload) =>
  apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });

export const getMeRequest = (token: string) =>
  apiClient<User>("/auth/me", {
    token,
  });

export const getRankingRequest = () =>
  apiClient<RankingUser[]>("/users/ranking");

export const updateProfileRequest = (
  payload: UpdateProfilePayload,
  token: string,
) =>
  apiClient<User>("/users/me/profile", {
    method: "PATCH",
    body: payload,
    token,
  });

export const changePasswordRequest = (
  payload: ChangePasswordPayload,
  token: string,
) =>
  apiClient<MessageResponse>("/users/me/password", {
    method: "PATCH",
    body: payload,
    token,
  });
