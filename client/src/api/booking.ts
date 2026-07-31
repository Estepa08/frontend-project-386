import { request } from "./client";
import type { components } from "@/api/generated/schema";

export type MeetInput = components["schemas"]["MeetInput"];
export type Meet = components["schemas"]["Meet"];

export type MeetResult = Meet;

export { request, ApiRequestError } from "./client";

export function createMeet(body: MeetInput): Promise<MeetResult> {
  return request<MeetResult>("/api/meets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
