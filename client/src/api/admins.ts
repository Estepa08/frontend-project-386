import { request } from "./client";
import type { components } from "@/api/generated/schema";

export type Admin = components["schemas"]["Admin"];
export type AdminCreate = components["schemas"]["AdminCreate"];

export function createAdmin(body: AdminCreate): Promise<Admin> {
  return request<Admin>("/api/admins", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
