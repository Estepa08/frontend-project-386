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

export function fetchAvailability(): Promise<Availability> {
  return request<Availability>("/api/availability");
}

export function updateAvailability(body: Availability): Promise<Availability> {
  return request<Availability>("/api/availability", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
