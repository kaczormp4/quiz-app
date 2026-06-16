const API_URL = import.meta.env.VITE_API_URL;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiClientOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
};

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);

    throw new Error(
      errorPayload?.detail ?? `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}
