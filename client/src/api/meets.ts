import { request } from "./client";

export interface MeetResult {
  id: number;
  adminId: string;
  userId: string;
  meetingTypeId: number;
  startTime: string;
  endTime: string;
  theme: string;
  status: "confirmed" | "cancelled";
  inviteLink: string;
  comment?: string;
  guestEmails?: string[];
  adminName?: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
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
  const qs = params.toString();
  const endpoint = `/api/${role}s/${userId}/meets${qs ? `?${qs}` : ""}`;
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
