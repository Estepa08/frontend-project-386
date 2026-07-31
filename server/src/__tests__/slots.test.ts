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
  beforeAll(async () => {
    const weekdays = ["mon", "tue", "wed", "thu", "fri"].map((dayOfWeek) => ({
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
    }));
    await request.put("/api/availability").send({
      workingHours: weekdays,
      slotDurations: ["15", "30"],
    });
  });

  it("GET /api/available-dates — returns dates for the current month", async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const res = await request.get(`/api/available-dates?month=${month}&duration=30`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dates)).toBe(true);
    expect(res.body.dates.length).toBeGreaterThan(0);
  });

  it("GET /api/slots — returns 30-minute slots for a weekday", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const res = await request.get(`/api/slots?date=${dateStr}&duration=30`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(18);
    expect(res.body.slots[0]).toEqual({ startTime: "09:00", endTime: "09:30" });
    expect(res.body.slots[17]).toEqual({ startTime: "17:30", endTime: "18:00" });
  });

  it("GET /api/slots — returns 15-minute slots for a weekday", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const res = await request.get(`/api/slots?date=${dateStr}&duration=15`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(36);
    expect(res.body.slots[0]).toEqual({ startTime: "09:00", endTime: "09:15" });
    expect(res.body.slots[1]).toEqual({ startTime: "09:15", endTime: "09:30" });
    expect(res.body.slots[35]).toEqual({ startTime: "17:45", endTime: "18:00" });
  });

  it("GET /api/slots — returns empty array for a weekend", async () => {
    const saturday = nextWeekday(6);
    const dateStr = toDateStr(saturday);

    const res = await request.get(`/api/slots?date=${dateStr}&duration=15`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual([]);
  });

  it("GET /api/slots — rejects an invalid duration", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const res = await request.get(`/api/slots?date=${dateStr}&duration=60`);
    expect(res.status).toBe(400);
  });

  it("GET /api/slots — 30-minute meet blocks overlapping 15-minute slots", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const created = await request.post("/api/meets").send({
      name: "Owner",
      theme: "Blocking meet",
      startTime: toIso(dateStr, "09:00"),
      endTime: toIso(dateStr, "09:30"),
    });
    expect(created.status).toBe(201);

    const res = await request.get(`/api/slots?date=${dateStr}&duration=15`);
    expect(res.status).toBe(200);

    const blockedSlots = res.body.slots.filter((slot: { startTime: string }) => slot.startTime === "09:00" || slot.startTime === "09:15");
    expect(blockedSlots).toEqual([]);
    expect(res.body.slots.some((slot: { startTime: string }) => slot.startTime === "09:30")).toBe(true);
  });

  it("GET /api/slots — 15-minute meet blocks overlapping 30-minute slot", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const created = await request.post("/api/meets").send({
      name: "Owner",
      theme: "Blocking meet",
      startTime: toIso(dateStr, "10:00"),
      endTime: toIso(dateStr, "10:15"),
    });
    expect(created.status).toBe(201);

    const res = await request.get(`/api/slots?date=${dateStr}&duration=30`);
    expect(res.status).toBe(200);

    const blockedSlots = res.body.slots.filter((slot: { startTime: string }) => slot.startTime === "10:00");
    expect(blockedSlots).toEqual([]);
    expect(res.body.slots.some((slot: { startTime: string }) => slot.startTime === "10:30")).toBe(true);
  });
});
