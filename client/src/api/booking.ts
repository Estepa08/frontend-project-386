export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface MeetingType {
  id: number;
  duration: 15 | 30;
  category: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface CreateMeetBody {
  adminId: string;
  userId: string;
  meetingTypeId: number;
  startTime: string;
  endTime: string;
  theme: string;
  comment?: string;
  guestEmails?: string[];
}

export interface MeetResult {
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

interface AvailableDatesResponse {
  dates: string[];
}

interface SlotsResponse {
  slots: Slot[];
}

export function fetchAdmins(): Promise<Admin[]> {
  return request<Admin[]>("/api/admins");
}

export function fetchMeetingTypes(adminId: string): Promise<MeetingType[]> {
  return request<MeetingType[]>(`/api/admins/${adminId}/meeting-types`);
}

export function fetchAvailableDates(
  adminId: string,
  month: string,
  meetingTypeId?: number,
): Promise<AvailableDatesResponse> {
  const params = new URLSearchParams({ month });
  if (meetingTypeId) params.set("meetingTypeId", String(meetingTypeId));
  return request<AvailableDatesResponse>(
    `/api/admins/${adminId}/available-dates?${params}`,
  );
}

export function fetchSlots(
  adminId: string,
  date: string,
  meetingTypeId?: number,
): Promise<SlotsResponse> {
  const params = new URLSearchParams({ date });
  if (meetingTypeId) params.set("meetingTypeId", String(meetingTypeId));
  return request<SlotsResponse>(`/api/admins/${adminId}/slots?${params}`);
}

export function createMeet(body: CreateMeetBody): Promise<MeetResult> {
  return request<MeetResult>("/api/meets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function combineDateAndTime(date: Date, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const dt = new Date(date);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
}
