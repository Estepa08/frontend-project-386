import { request } from "./client";
import type { components } from "@/api/generated/schema";
import { MEET_STATUS, type Role, type MeetStatus } from "@/lib/constants";

export type Meet = components["schemas"]["Meet"];
export type MeetPatch = components["schemas"]["MeetPatch"];

export interface MeetResult extends Meet {
  admin?: { id: string; name: string; email: string };
  user?: { id: string; name: string; email: string };
}

export interface MeetFilters {
  status?: MeetStatus;
  date?: string;
}

export function fetchMeets(
  role: Role,
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
    body: JSON.stringify({ status: MEET_STATUS.CANCELLED }),
  });
}

export function updateMeet(
  id: number,
  body: MeetPatch,
): Promise<MeetResult> {
  return request<MeetResult>(`/api/meets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
