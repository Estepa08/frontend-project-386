import { request } from "./client";
import type { components } from "@/api/generated/schema";

type AdminOrUser = components["schemas"]["Admin"] | components["schemas"]["User"];

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AdminOrUser;
  role: "admin" | "user";
}

export function login(body: LoginBody): Promise<LoginResult> {
  return request<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
