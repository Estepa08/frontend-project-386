import { request } from "./client";
import type { Day } from "@/lib/constants";

export interface WorkingHour {
  dayOfWeek: Day;
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
