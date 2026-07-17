import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { describeIfDb } from "./helpers.js";

const request = supertest(app);

describeIfDb("Slots API", () => {
  let adminId: string;
  let meetingTypeId15: number;
  let meetingTypeId30: number;

  beforeAll(async () => {
    const adminRes = await request.post("/api/admins").send({
      name: "Slot Admin",
      email: "slotadmin@example.com",
      password: "password123",
    });
    adminId = adminRes.body.id;

    const mt15 = await request.post(`/api/admins/${adminId}/meeting-types`).send({
      duration: 15,
      category: "single",
    });
    meetingTypeId15 = mt15.body.id;

    const mt30 = await request.post(`/api/admins/${adminId}/meeting-types`).send({
      duration: 30,
      category: "group",
    });
    meetingTypeId30 = mt30.body.id;

    // Set working hours: Monday-Friday 09:00-18:00
    const loginRes = await request
      .post("/api/auth/login")
      .send({ email: "slotadmin@example.com", password: "password123" });
    const token = loginRes.body.token;

    await request
      .put(`/api/admins/${adminId}/availability`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        workingHours: [
          { dayOfWeek: "mon", startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: "tue", startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: "wed", startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: "thu", startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: "fri", startTime: "09:00", endTime: "18:00" },
        ],
      });
  });

  it("GET /api/admins/:id/available-dates — returns dates for current month", async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const res = await request.get(`/api/admins/${adminId}/available-dates?month=${month}`);
    expect(res.status).toBe(200);
    expect(res.body.dates).toBeDefined();
    expect(Array.isArray(res.body.dates)).toBe(true);
    // Should return at least some weekdays
    expect(res.body.dates.length).toBeGreaterThan(0);
  });

  it("GET /api/admins/:id/available-dates — returns 404 for non-existent admin", async () => {
    const res = await request.get(
      "/api/admins/00000000-0000-0000-0000-000000000000/available-dates?month=2026-07",
    );
    expect(res.status).toBe(404);
  });

  it("GET /api/admins/:id/slots — returns slots for a weekday", async () => {
    // Find next Monday
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 6 ? 2 : (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    const dateStr = nextMonday.toISOString().split("T")[0];

    const res = await request.get(`/api/admins/${adminId}/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toBeDefined();
    expect(Array.isArray(res.body.slots)).toBe(true);
    // 09:00-18:00 with 15min slots = 36 slots
    expect(res.body.slots.length).toBe(36);
  });

  it("GET /api/admins/:id/slots — returns 30min slots when meetingTypeId is specified", async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 6 ? 2 : (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    const dateStr = nextMonday.toISOString().split("T")[0];

    const res = await request.get(
      `/api/admins/${adminId}/slots?date=${dateStr}&meetingTypeId=${meetingTypeId30}`,
    );
    expect(res.status).toBe(200);
    // 09:00-18:00 with 30min slots = 18 slots
    expect(res.body.slots.length).toBe(18);
  });

  it("GET /api/admins/:id/slots — returns empty array for weekend with no hours", async () => {
    // Find next Saturday
    const now = new Date();
    const daysUntilSaturday = now.getDay() === 6 ? 0 : (6 - now.getDay() + 7) % 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + (daysUntilSaturday || 7));
    const dateStr = nextSaturday.toISOString().split("T")[0];

    const res = await request.get(`/api/admins/${adminId}/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual([]);
  });

  it("GET /api/admins/:id/slots — returns 404 for non-existent admin", async () => {
    const res = await request.get(
      "/api/admins/00000000-0000-0000-0000-000000000000/slots?date=2026-07-15",
    );
    expect(res.status).toBe(404);
  });
});
