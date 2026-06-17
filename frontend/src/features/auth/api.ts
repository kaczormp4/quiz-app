import { apiClient } from "../../shared/api/client";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "./types";

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
