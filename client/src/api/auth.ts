import { request } from "./client";

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  role: "admin" | "user";
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export function login(body: LoginBody): Promise<LoginResult> {
  return request<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
