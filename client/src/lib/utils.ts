import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const TIME_SLOTS = Array.from({ length: 19 }, (_, index) => {
  const hour = Math.floor(index / 2) + 9;
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export const SLOT_COUNT = 19;
export const START_HOUR = 9;
export const CLIPBOARD_FEEDBACK_DURATION = 2000;
export const REFETCH_INTERVAL = 30_000;
export const ONE_MINUTE_MS = 60000;
