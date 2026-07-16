import { request } from "./client";

export interface WorkingHour {
  dayOfWeek: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  startTime: string;
  endTime: string;
}

export interface Availability {
  workingHours: WorkingHour[];
}

export function fetchAvailability(adminId: string): Promise<Availability> {
  return request<Availability>(`/api/admins/${adminId}/availability`);
}

export function updateAvailability(
  adminId: string,
  body: Availability,
): Promise<Availability> {
  return request<Availability>(`/api/admins/${adminId}/availability`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
