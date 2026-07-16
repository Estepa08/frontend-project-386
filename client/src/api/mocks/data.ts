export const workingHours = [
  { dayOfWeek: "mon" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "tue" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "wed" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "thu" as const, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "fri" as const, startTime: "09:00", endTime: "18:00" },
];

export interface MeetType {
  id: number;
  adminId: string;
  duration: number;
  category: string;
  visible: boolean;
  allowGuestInvite: boolean;
}

const initialTypes: MeetType[] = [
  { id: 1, adminId: "1", duration: 15, category: "single", visible: true, allowGuestInvite: false },
  { id: 2, adminId: "1", duration: 30, category: "group", visible: true, allowGuestInvite: true },
];

export let meetingTypes: MeetType[] = [...initialTypes];

export interface Meet {
  id: number;
  adminId: string;
  userId: string;
  meetingTypeId: number;
  startTime: string;
  endTime: string;
  theme: string;
  status: string;
  inviteLink: string;
  createdAt: string;
  updatedAt: string;
}

export let meets: Meet[] = [
  {
    id: 1,
    adminId: "1",
    userId: "2",
    meetingTypeId: 1,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 15 * 60000).toISOString(),
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
    endTime: new Date(Date.now() + 30 * 60000).toISOString(),
    theme: "Консультация",
    status: "cancelled",
    inviteLink: "https://meetly.app/invite/def456",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
