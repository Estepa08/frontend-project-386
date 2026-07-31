import { request } from "./client";
import type { components } from "@/api/generated/schema";

export type EventType = components["schemas"]["EventType"];
export type EventTypeInput = components["schemas"]["EventTypeInput"];

export function fetchEventTypes(): Promise<EventType[]> {
  return request<EventType[]>("/api/event-types");
}

export function fetchEventType(id: number): Promise<EventType> {
  return request<EventType>(`/api/event-types/${id}`);
}

export function createEventType(body: EventTypeInput): Promise<EventType> {
  return request<EventType>("/api/event-types", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateEventType(id: number, body: EventTypeInput): Promise<EventType> {
  return request<EventType>(`/api/event-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteEventType(id: number): Promise<void> {
  return request<void>(`/api/event-types/${id}`, { method: "DELETE" });
}

export function fetchAvailableDates(
  eventTypeId: number,
): Promise<components["schemas"]["AvailableDates"]> {
  return request<components["schemas"]["AvailableDates"]>(
    `/api/event-types/${eventTypeId}/available-dates`,
  );
}

export function fetchSlots(
  eventTypeId: number,
  date: string,
): Promise<components["schemas"]["Slots"]> {
  const params = new URLSearchParams({ date });
  return request<components["schemas"]["Slots"]>(
    `/api/event-types/${eventTypeId}/slots?${params}`,
  );
}
