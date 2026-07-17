import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { describeIfDb, uniqueId } from "./helpers.js";

const request = supertest(app);
const uid = uniqueId();

describeIfDb("Slots API", () => {
  let adminId: string;
  let adminToken: string;
  let meetingTypeId30: number;

  beforeAll(async () => {
    const adminRes = await request.post("/api/admins").send({
      name: "Slot Admin",
      email: `slotadmin-${uid}@example.com`,
      password: "password123",
    });
    adminId = adminRes.body.id;

    const loginRes = await request
      .post("/api/auth/login")
      .send({ email: `slotadmin-${uid}@example.com`, password: "password123" });
    adminToken = loginRes.body.token;

    const mt30 = await request
      .post(`/api/admins/${adminId}/meeting-types`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ duration: 30, category: "group" });
    meetingTypeId30 = mt30.body.id;

    await request
      .put(`/api/admins/${adminId}/availability`)
      .set("Authorization", `Bearer ${adminToken}`)
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
    expect(res.body.dates.length).toBeGreaterThan(0);
  });

  it("GET /api/admins/:id/available-dates — returns 404 for non-existent admin", async () => {
    const res = await request.get(
      "/api/admins/00000000-0000-0000-0000-000000000000/available-dates?month=2026-07",
    );
    expect(res.status).toBe(404);
  });

  it("GET /api/admins/:id/slots — returns slots for a weekday", async () => {
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
    expect(res.body.slots.length).toBe(18);
  });

  it("GET /api/admins/:id/slots — returns empty array for weekend with no hours", async () => {
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
