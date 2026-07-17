import { request } from "./client";
import type { components } from "@/api/generated/schema";

export type Admin = components["schemas"]["Admin"];
export type MeetingType = components["schemas"]["MeetingType"];
export type Slot = components["schemas"]["Slot"];
export type MeetInput = components["schemas"]["MeetInput"];
export type Meet = components["schemas"]["Meet"];

export { request, ApiRequestError } from "./client";

export interface MeetResult extends Meet {
  admin?: { id: string; name: string; email: string };
  user?: { id: string; name: string; email: string };
}

export function fetchAdmins(): Promise<Admin[]> {
  return request<Admin[]>("/api/admins");
}

export function fetchMeetingTypes(adminId: string): Promise<MeetingType[]> {
  return request<MeetingType[]>(`/api/admins/${adminId}/meeting-types`);
}

export function fetchAvailableDates(
  adminId: string,
  month: string,
  meetingTypeId?: number,
): Promise<components["schemas"]["AvailableDates"]> {
  const params = new URLSearchParams({ month });
  if (meetingTypeId) params.set("meetingTypeId", String(meetingTypeId));
  return request<components["schemas"]["AvailableDates"]>(
    `/api/admins/${adminId}/available-dates?${params}`,
  );
}

export function fetchSlots(
  adminId: string,
  date: string,
  meetingTypeId?: number,
): Promise<components["schemas"]["Slots"]> {
  const params = new URLSearchParams({ date });
  if (meetingTypeId) params.set("meetingTypeId", String(meetingTypeId));
  return request<components["schemas"]["Slots"]>(`/api/admins/${adminId}/slots?${params}`);
}

export function createMeet(body: MeetInput): Promise<MeetResult> {
  return request<MeetResult>("/api/meets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}


