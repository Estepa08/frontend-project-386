import { request } from "./client";
import type { Role } from "@/lib/constants";

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  role: Role;
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
