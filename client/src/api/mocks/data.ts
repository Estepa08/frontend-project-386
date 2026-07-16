import { ONE_MINUTE_MS } from "@/lib/utils";
import type { components } from "@/api/generated/schema";

export const workingHours = [
  { dayOfWeek: "mon" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "tue" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "wed" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "thu" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "fri" as const, startTime: "09:00", endTime: "18:00" },
];

export type MeetType = components["schemas"]["MeetingType"];

const initialTypes: MeetType[] = [
  { id: 1, adminId: "1", duration: 15, category: "single", visible: true, allowGuestInvite: false },
  { id: 2, adminId: "1", duration: 30, category: "group", visible: true, allowGuestInvite: true },
];

export const meetingTypes: MeetType[] = [...initialTypes];

export type Meet = components["schemas"]["Meet"];

export const meets: Meet[] = [
  {
    id: 1,
    adminId: "1",
    userId: "2",
    meetingTypeId: 1,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 15 * ONE_MINUTE_MS).toISOString(),
    theme: "Брифинг",
    status: "confirmed",
    inviteLink: "https://meetly.app/invite/abc123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    adminId: "1",
    userId: "2",
    meetingTypeId: 2,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * ONE_MINUTE_MS).toISOString(),
    theme: "Консультация",
    status: "cancelled",
    inviteLink: "https://meetly.app/invite/def456",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
