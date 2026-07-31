import { request } from "./client";
import type { components } from "@/api/generated/schema";
import type { SlotDuration } from "@/lib/constants";

export type Slot = components["schemas"]["Slot"];
export type MeetInput = components["schemas"]["MeetInput"];
export type Meet = components["schemas"]["Meet"];

export type MeetResult = Meet;

export { request, ApiRequestError } from "./client";

export function fetchAvailableDates(
  month: string,
  duration: SlotDuration,
): Promise<components["schemas"]["AvailableDates"]> {
  const params = new URLSearchParams({ month, duration });
  return request<components["schemas"]["AvailableDates"]>(`/api/available-dates?${params}`);
}

export function fetchSlots(date: string, duration: SlotDuration): Promise<components["schemas"]["Slots"]> {
  const params = new URLSearchParams({ date, duration });
  return request<components["schemas"]["Slots"]>(`/api/slots?${params}`);
}

export function createMeet(body: MeetInput): Promise<MeetResult> {
  return request<MeetResult>("/api/meets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
