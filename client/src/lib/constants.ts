export const MEET_STATUS = { CONFIRMED: "confirmed", CANCELLED: "cancelled" } as const;
export type MeetStatus = typeof MEET_STATUS[keyof typeof MEET_STATUS];
export const STATUS_LABELS: Record<MeetStatus, string> = {
  confirmed: "Подтверждено",
  cancelled: "Отменено",
};

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];
export const DAY_LABELS: Record<Day, string> = {
  mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт",
  fri: "Пт", sat: "Сб", sun: "Вс",
};

export const DEFAULT_START = "09:00";
export const DEFAULT_END = "18:00";

export const START_HOUR = 9;
export const SLOT_COUNT = 19;
export const TIME_SLOTS = Array.from({ length: SLOT_COUNT }, (_, index) => {
  const hour = Math.floor(index / 2) + START_HOUR;
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export const PAGE_SIZE = 20;

export const NAV: readonly { to: string; label: string; end?: boolean }[] = [
  { to: "/booking", label: "Забронировать" },
  { to: "/admin", label: "Обзор", end: true },
  { to: "/admin/meets", label: "Встречи" },
  { to: "/admin/availability", label: "График" },
];
