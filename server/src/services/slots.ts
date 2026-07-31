import { memoryStore } from "../lib/memory-store.js";

const SLOT_DURATION_MIN = 30;

interface Slot {
  startTime: string;
  endTime: string;
}

function getDayOfWeek(date: Date): string {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

function toTimeStr(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

async function getOccupied(dayStart: Date, dayEnd: Date): Promise<Array<{ start: number; end: number }>> {
  const meets = await memoryStore.meet.findMany({
    where: {
      status: "confirmed",
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
  });
  return meets.map((m) => ({
    start: (m.startTime as Date).getTime(),
    end: (m.endTime as Date).getTime(),
  }));
}

export async function getAvailableDates(month: string): Promise<string[]> {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const mon = Number(monthStr);

  const workingHours = await memoryStore.workingHour.findMany({});
  if (workingHours.length === 0) return [];

  const workingDays = new Set(workingHours.map((wh) => wh.dayOfWeek));

  const daysInMonth = new Date(year, mon, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const available: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, mon - 1, day);
    if (date < today) continue;

    const dow = getDayOfWeek(date);
    if (!workingDays.has(dow)) continue;

    const dayWorkingHours = workingHours.filter((wh) => wh.dayOfWeek === dow);
    if (dayWorkingHours.length === 0) continue;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const occupied = await getOccupied(dayStart, dayEnd);

    let hasSlot = false;

    for (const wh of dayWorkingHours) {
      const whStart = parseTime(wh.startTime);
      const whEnd = parseTime(wh.endTime);

      for (let m = whStart; m + SLOT_DURATION_MIN <= whEnd; m += SLOT_DURATION_MIN) {
        const slotStart = new Date(date);
        slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0);
        const slotEnd = addMinutes(slotStart, SLOT_DURATION_MIN);

        const conflict = occupied.some(
          (o) => slotStart.getTime() < o.end && slotEnd.getTime() > o.start,
        );

        if (!conflict) {
          hasSlot = true;
          break;
        }
      }
      if (hasSlot) break;
    }

    if (hasSlot) {
      available.push(toDateStr(date));
    }
  }

  return available;
}

export async function getSlots(date: string): Promise<Slot[]> {
  const dateObj = new Date(date + "T00:00:00Z");
  const dow = getDayOfWeek(dateObj);

  const dayWorkingHours = await memoryStore.workingHour.findMany({
    where: { dayOfWeek: dow },
  });

  if (dayWorkingHours.length === 0) return [];

  const dayStart = new Date(dateObj);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateObj);
  dayEnd.setHours(23, 59, 59, 999);

  const occupied = await getOccupied(dayStart, dayEnd);

  const slots: Slot[] = [];

  for (const wh of dayWorkingHours) {
    const whStartMinutes = parseTime(wh.startTime);
    const whEndMinutes = parseTime(wh.endTime);

    for (let m = whStartMinutes; m + SLOT_DURATION_MIN <= whEndMinutes; m += SLOT_DURATION_MIN) {
      const slotStart = new Date(dateObj);
      slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0);
      const slotEnd = addMinutes(slotStart, SLOT_DURATION_MIN);

      const conflict = occupied.some(
        (o) => slotStart.getTime() < o.end && slotEnd.getTime() > o.start,
      );

      if (!conflict) {
        slots.push({
          startTime: toTimeStr(slotStart),
          endTime: toTimeStr(slotEnd),
        });
      }
    }
  }

  return slots;
}
