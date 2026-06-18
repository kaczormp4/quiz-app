import type { BillingPlan, BillingStatus, CheckoutResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(errorBody?.detail ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function getBillingPlansRequest(): Promise<BillingPlan[]> {
  const response = await fetch(`${API_URL}/billing/plans`);

  return parseResponse<BillingPlan[]>(response);
}

export async function getMyBillingStatusRequest(
  token: string,
): Promise<BillingStatus> {
  const response = await fetch(`${API_URL}/billing/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<BillingStatus>(response);
}

export async function createCheckoutRequest(
  planCode: string,
  token: string,
): Promise<CheckoutResponse> {
  const response = await fetch(`${API_URL}/billing/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan_code: planCode,
    }),
  });

  return parseResponse<CheckoutResponse>(response);
}
