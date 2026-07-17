import { request } from "./client";
import type { components } from "@/api/generated/schema";

export type User = components["schemas"]["User"];
export type UserCreate = components["schemas"]["UserCreate"];

export function createUser(body: UserCreate): Promise<User> {
  return request<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
