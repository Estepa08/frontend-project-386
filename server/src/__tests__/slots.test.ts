import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toIso(dateStr: string, time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(dateStr + "T00:00:00Z");
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function nextWeekday(target: number): Date {
  const now = new Date();
  const daysUntil = (target - now.getDay() + 7) % 7 || 7;
  const date = new Date(now);
  date.setDate(now.getDate() + daysUntil);
  return date;
}

describe("Slots API", () => {
  let shortEventTypeId: number;
  let longEventTypeId: number;

  beforeAll(async () => {
    const weekdays = ["mon", "tue", "wed", "thu", "fri"].map((dayOfWeek) => ({
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
    }));
    await request.put("/api/availability").send({ workingHours: weekdays });

    const shortRes = await request.post("/api/event-types").send({
      title: "Короткая",
      description: "15 минут",
      durationMinutes: 15,
    });
    shortEventTypeId = shortRes.body.id;

    const longRes = await request.post("/api/event-types").send({
      title: "Длинная",
      description: "30 минут",
      durationMinutes: 30,
    });
    longEventTypeId = longRes.body.id;
  });

  it("GET /api/event-types/:id/available-dates — returns dates within the 14-day window", async () => {
    const res = await request.get(`/api/event-types/${longEventTypeId}/available-dates`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dates)).toBe(true);
    expect(res.body.dates.length).toBeGreaterThan(0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowEnd = new Date(today);
    windowEnd.setDate(today.getDate() + 13);

    for (const dateStr of res.body.dates) {
      const date = new Date(dateStr + "T00:00:00");
      expect(date.getTime()).toBeGreaterThanOrEqual(today.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(windowEnd.getTime());
    }
  });

  it("GET /api/event-types/:id/available-dates — returns 404 for an unknown event type", async () => {
    const res = await request.get("/api/event-types/999999/available-dates");
    expect(res.status).toBe(404);
  });

  it("GET /api/event-types/:id/slots — returns 30-minute slots for a weekday", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const res = await request.get(`/api/event-types/${longEventTypeId}/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(18);
    expect(res.body.slots[0]).toEqual({ startTime: "09:00", endTime: "09:30" });
    expect(res.body.slots[17]).toEqual({ startTime: "17:30", endTime: "18:00" });
  });

  it("GET /api/event-types/:id/slots — returns 15-minute slots for a weekday", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const res = await request.get(`/api/event-types/${shortEventTypeId}/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(36);
    expect(res.body.slots[0]).toEqual({ startTime: "09:00", endTime: "09:15" });
    expect(res.body.slots[1]).toEqual({ startTime: "09:15", endTime: "09:30" });
    expect(res.body.slots[35]).toEqual({ startTime: "17:45", endTime: "18:00" });
  });

  it("GET /api/event-types/:id/slots — returns empty array for a weekend", async () => {
    const saturday = nextWeekday(6);
    const dateStr = toDateStr(saturday);

    const res = await request.get(`/api/event-types/${shortEventTypeId}/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual([]);
  });

  it("GET /api/event-types/:id/slots — returns 404 for an unknown event type", async () => {
    const dateStr = toDateStr(nextWeekday(1));
    const res = await request.get(`/api/event-types/999999/slots?date=${dateStr}`);
    expect(res.status).toBe(404);
  });

  it("GET /api/event-types/:id/slots — excludes slots that have already started for today", async () => {
    const todayStr = toDateStr(new Date());
    const res = await request.get(`/api/event-types/${longEventTypeId}/slots?date=${todayStr}`);
    expect(res.status).toBe(200);

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const pastSlots = res.body.slots.filter((slot: { startTime: string }) => {
      const [hours, minutes] = slot.startTime.split(":").map(Number);
      return hours * 60 + minutes < nowMinutes;
    });
    expect(pastSlots).toEqual([]);
  });

  it("GET /api/event-types/:id/slots — 30-minute meet blocks overlapping 15-minute slots", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const created = await request.post("/api/meets").send({
      eventTypeId: longEventTypeId,
      name: "Owner",
      theme: "Blocking meet",
      startTime: toIso(dateStr, "09:00"),
    });
    expect(created.status).toBe(201);

    const res = await request.get(`/api/event-types/${shortEventTypeId}/slots?date=${dateStr}`);
    expect(res.status).toBe(200);

    const blockedSlots = res.body.slots.filter(
      (slot: { startTime: string }) => slot.startTime === "09:00" || slot.startTime === "09:15",
    );
    expect(blockedSlots).toEqual([]);
    expect(res.body.slots.some((slot: { startTime: string }) => slot.startTime === "09:30")).toBe(true);
  });

  it("GET /api/event-types/:id/slots — 15-minute meet blocks overlapping 30-minute slot", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const created = await request.post("/api/meets").send({
      eventTypeId: shortEventTypeId,
      name: "Owner",
      theme: "Blocking meet",
      startTime: toIso(dateStr, "10:00"),
    });
    expect(created.status).toBe(201);

    const res = await request.get(`/api/event-types/${longEventTypeId}/slots?date=${dateStr}`);
    expect(res.status).toBe(200);

    const blockedSlots = res.body.slots.filter(
      (slot: { startTime: string }) => slot.startTime === "10:00",
    );
    expect(blockedSlots).toEqual([]);
    expect(res.body.slots.some((slot: { startTime: string }) => slot.startTime === "10:30")).toBe(true);
  });
});
