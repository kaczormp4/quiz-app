const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

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
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API_URL}${normalizedPath}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorPayload = JSON.parse(responseText);
      errorMessage = errorPayload?.detail ?? errorMessage;
    } catch {
      errorMessage = responseText.slice(0, 200);
    }

    throw new Error(errorMessage);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but received: ${responseText.slice(0, 120)}`,
    );
  }

  return JSON.parse(responseText) as T;
}
