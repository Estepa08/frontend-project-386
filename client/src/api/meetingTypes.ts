import { request } from "./client";
import type { components } from "@/api/generated/schema";

export type MeetingType = components["schemas"]["MeetingType"];
export type MeetingTypeInput = components["schemas"]["MeetingTypeInput"];
export type MeetingTypePatch = components["schemas"]["MeetingTypePatch"];

export function fetchMeetingTypes(adminId: string): Promise<MeetingType[]> {
  return request(`/api/admins/${adminId}/meeting-types`);
}

export function createMeetingType(
  adminId: string,
  body: MeetingTypeInput,
): Promise<MeetingType> {
  return request(`/api/admins/${adminId}/meeting-types`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateMeetingType(
  id: number,
  body: MeetingTypePatch,
): Promise<MeetingType> {
  return request(`/api/meeting-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMeetingType(id: number): Promise<void> {
  return request(`/api/meeting-types/${id}`, { method: "DELETE" });
}
