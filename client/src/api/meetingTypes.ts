import { request } from "./booking";

export interface MeetingType {
  id: number;
  adminId: string;
  duration: 15 | 30;
  category: "single" | "group" | "private";
  visible: boolean;
  allowGuestInvite: boolean;
}

export interface MeetingTypeInput {
  duration: 15 | 30;
  category: string;
}

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
  body: Partial<
    MeetingTypeInput & { visible?: boolean; allowGuestInvite?: boolean }
  >,
): Promise<MeetingType> {
  return request(`/api/meeting-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMeetingType(id: number): Promise<void> {
  return request(`/api/meeting-types/${id}`, { method: "DELETE" });
}
