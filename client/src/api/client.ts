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
  } catch (error) {
    console.warn("Failed to read token from localStorage:", error);
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn("Failed to save token to localStorage:", error);
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn("Failed to clear token from localStorage:", error);
  }
}

function mergeHeaders(
  initHeaders?: HeadersInit,
): Record<string, string> {
  if (!initHeaders) return {};
  if (initHeaders instanceof Headers) {
    const result: Record<string, string> = {};
    initHeaders.forEach((value, key) => { result[key] = value; });
    return result;
  }
  if (Array.isArray(initHeaders)) {
    return Object.fromEntries(initHeaders);
  }
  return initHeaders as Record<string, string>;
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = mergeHeaders(options?.headers);

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
      const body = (await res.json()) as { error?: { code?: string; message?: string } };
      if (body?.error?.code && body?.error?.message) {
        code = body.error.code;
        message = body.error.message;
      }
    } catch (parseError) {
      console.warn("Failed to parse error response:", parseError);
    }

    throw new ApiRequestError(code, message);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}
