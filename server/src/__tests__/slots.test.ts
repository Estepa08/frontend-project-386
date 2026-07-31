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
    await request.put("/api/availability").send({ workingHours: weekdays });
  });

  it("GET /api/available-dates — returns dates for the current month", async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const res = await request.get(`/api/available-dates?month=${month}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dates)).toBe(true);
    expect(res.body.dates.length).toBeGreaterThan(0);
  });

  it("GET /api/slots — returns 30-minute slots for a weekday", async () => {
    const dateStr = toDateStr(nextWeekday(1));

    const res = await request.get(`/api/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(18);
    expect(res.body.slots[0]).toEqual({ startTime: "09:00", endTime: "09:30" });
    expect(res.body.slots[17]).toEqual({ startTime: "17:30", endTime: "18:00" });
  });

  it("GET /api/slots — returns empty array for a weekend", async () => {
    const saturday = nextWeekday(6);
    const dateStr = toDateStr(saturday);

    const res = await request.get(`/api/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual([]);
  });
});
