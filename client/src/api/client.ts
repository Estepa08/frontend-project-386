export class ApiRequestError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

const TOKEN_KEY = "meetly_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage not available
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage not available
  }
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] ??= "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] ??= `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let code = "UNKNOWN";
    let message = `API Error: ${res.status} ${res.statusText}`;

    try {
      const body = await res.json();
      if (body?.error?.code && body?.error?.message) {
        code = body.error.code;
        message = body.error.message;
      }
    } catch {
      // not valid JSON, use defaults
    }

    throw new ApiRequestError(code, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
