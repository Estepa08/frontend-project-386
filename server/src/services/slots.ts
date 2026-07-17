import { prisma } from "../lib/prisma.js";

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

export async function getAvailableDates(
  adminId: string,
  month: string,
  meetingTypeId?: number,
): Promise<string[]> {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const mon = Number(monthStr);

  const workingHours = await prisma.workingHour.findMany({ where: { adminId } });
  if (workingHours.length === 0) return [];

  const workingDays = new Set(workingHours.map((wh) => wh.dayOfWeek));

  const meetingTypes = meetingTypeId
    ? await prisma.meetingType.findMany({
        where: { adminId, id: meetingTypeId },
      })
    : await prisma.meetingType.findMany({ where: { adminId } });

  if (meetingTypes.length === 0) return [];

  const durations = meetingTypes.map((mt) => mt.duration);

  const daysInMonth = new Date(year, mon, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const available: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, mon - 1, day);
    if (date < today) continue;

    const dow = getDayOfWeek(date);
    if (!workingDays.has(dow)) continue;

    const dateStr = toDateStr(date);
    const dayWorkingHours = workingHours.filter((wh) => wh.dayOfWeek === dow);
    if (dayWorkingHours.length === 0) continue;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const meets = await prisma.meet.findMany({
      where: {
        adminId,
        status: "confirmed",
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
      select: { startTime: true, endTime: true },
    });

    const occupied: Array<{ start: number; end: number }> = meets.map((m) => ({
      start: m.startTime.getTime(),
      end: m.endTime.getTime(),
    }));

    let hasSlot = false;

    for (const wh of dayWorkingHours) {
      const whStart = parseTime(wh.startTime);
      const whEnd = parseTime(wh.endTime);

      for (const duration of durations) {
        for (let m = whStart; m + duration <= whEnd; m += duration) {
          const slotStart = new Date(date);
          slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0);
          const slotEnd = addMinutes(slotStart, duration);

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
      if (hasSlot) break;
    }

    if (hasSlot) {
      available.push(dateStr);
    }
  }

  return available;
}

export async function getSlots(
  adminId: string,
  date: string,
  meetingTypeId?: number,
): Promise<Slot[]> {
  const dateObj = new Date(date + "T00:00:00Z");
  const dow = getDayOfWeek(dateObj);

  const dayWorkingHours = await prisma.workingHour.findMany({
    where: { adminId, dayOfWeek: dow },
  });

  if (dayWorkingHours.length === 0) return [];

  const meetingTypes = meetingTypeId
    ? await prisma.meetingType.findMany({
        where: { adminId, id: meetingTypeId },
      })
    : await prisma.meetingType.findMany({ where: { adminId } });

  if (meetingTypes.length === 0) return [];

  const duration = meetingTypeId ? meetingTypes[0].duration : 15;

  const dayStart = new Date(dateObj);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateObj);
  dayEnd.setHours(23, 59, 59, 999);

  const meets = await prisma.meet.findMany({
    where: {
      adminId,
      status: "confirmed",
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
  });

  const occupied: Array<{ start: number; end: number }> = meets.map((m) => ({
    start: m.startTime.getTime(),
    end: m.endTime.getTime(),
  }));

  const slots: Slot[] = [];

  for (const wh of dayWorkingHours) {
    const whStartMinutes = parseTime(wh.startTime);
    const whEndMinutes = parseTime(wh.endTime);

    for (let m = whStartMinutes; m + duration <= whEndMinutes; m += duration) {
      const slotStart = new Date(dateObj);
      slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0);
      const slotEnd = addMinutes(slotStart, duration);

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
