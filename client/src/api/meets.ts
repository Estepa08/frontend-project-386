import { request } from "./client";
import type { components } from "@/api/generated/schema";
import { MEET_STATUS, type MeetStatus } from "@/lib/constants";

export type Meet = components["schemas"]["Meet"];
export type MeetPatch = components["schemas"]["MeetPatch"];

export type MeetResult = Meet;

export interface MeetFilters {
  status?: MeetStatus;
  date?: string;
}

export function fetchMeets(filters?: MeetFilters): Promise<MeetResult[]> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set("status", filters.status);
  }
  if (filters?.date) {
    params.set("date", filters.date);
  }
  const queryString = params.toString();
  return request<MeetResult[]>(`/api/meets${queryString ? `?${queryString}` : ""}`);
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
