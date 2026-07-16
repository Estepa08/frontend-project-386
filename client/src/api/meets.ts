import { request } from "./client";
import type { components } from "@/api/generated/schema";

export type Meet = components["schemas"]["Meet"];

export interface MeetResult extends Meet {
  adminName?: string;
  userName?: string;
}

export interface MeetFilters {
  status?: "confirmed" | "cancelled";
  date?: string;
}

export function fetchMeets(
  role: "admin" | "user",
  userId: string,
  filters?: MeetFilters,
): Promise<MeetResult[]> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set("status", filters.status);
  }
  if (filters?.date) {
    params.set("date", filters.date);
  }
  const queryString = params.toString();
  const endpoint = `/api/${role}s/${userId}/meets${queryString ? `?${queryString}` : ""}`;
  return request<MeetResult[]>(endpoint);
}

export function fetchMeetById(id: number): Promise<MeetResult> {
  return request<MeetResult>(`/api/meets/${id}`);
}

export function cancelMeet(id: number): Promise<MeetResult> {
  return request<MeetResult>(`/api/meets/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled" }),
  });
}
