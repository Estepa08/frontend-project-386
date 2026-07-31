import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

const WORKING_HOURS = ["mon", "tue", "wed", "thu", "fri"].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "18:00",
}));

function nextWeekday(target: number): Date {
  const now = new Date();
  const daysUntil = (target - now.getDay() + 7) % 7 || 7;
  const date = new Date(now);
  date.setDate(now.getDate() + daysUntil);
  return date;
}

function atHour(day: Date, hour: number, minute = 0): string {
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function createEventType(durationMinutes: number): Promise<number> {
  const res = await request.post("/api/event-types").send({
    title: `Встреча ${durationMinutes} мин`,
    description: "Тестовый тип",
    durationMinutes,
  });
  return res.body.id;
}

describe("Meets API", () => {
  let meetId: number;
  let eventTypeId: number;
  let otherEventTypeId: number;
  const monday = nextWeekday(1);

  beforeAll(async () => {
    await request.put("/api/availability").send({ workingHours: WORKING_HOURS });
    eventTypeId = await createEventType(30);
    otherEventTypeId = await createEventType(30);
  });

  it("POST /api/meets — creates a meet", async () => {
    const res = await request.post("/api/meets").send({
      eventTypeId,
      name: "John Doe",
      email: "john@example.com",
      theme: "Consultation",
      startTime: atHour(monday, 10),
    });

    expect(res.status).toBe(201);
    expect(res.body.eventTypeId).toBe(eventTypeId);
    expect(res.body.name).toBe("John Doe");
    expect(res.body.theme).toBe("Consultation");
    expect(res.body.status).toBe("confirmed");
    expect(res.body.inviteLink).toBeDefined();
    expect(res.body.endTime).toBe(atHour(monday, 10, 30));
    meetId = res.body.id;
  });

  it("POST /api/meets — rejects an overlapping slot even for a different event type", async () => {
    const res = await request.post("/api/meets").send({
      eventTypeId: otherEventTypeId,
      name: "Jane Smith",
      theme: "Overlapping meet",
      startTime: atHour(monday, 10),
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("SLOT_TAKEN");
  });

  it("POST /api/meets — rejects an invalid body", async () => {
    const res = await request.post("/api/meets").send({
      name: "",
      theme: "No name",
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/meets — rejects an unknown event type", async () => {
    const res = await request.post("/api/meets").send({
      eventTypeId: 999999,
      name: "John Doe",
      theme: "No type",
      startTime: atHour(monday, 11),
    });
    expect(res.status).toBe(404);
  });

  it("POST /api/meets — rejects a slot outside working hours", async () => {
    const res = await request.post("/api/meets").send({
      eventTypeId,
      name: "Early Bird",
      theme: "Too early",
      startTime: atHour(monday, 7),
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("POST /api/meets — rejects a slot that is not offered", async () => {
    const res = await request.post("/api/meets").send({
      eventTypeId,
      name: "Off Grid",
      theme: "Misaligned slot",
      startTime: atHour(monday, 11, 15),
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("POST /api/meets — rejects a slot in the past", async () => {
    const start = new Date(Date.now() - 60 * 60000);
    const res = await request.post("/api/meets").send({
      eventTypeId,
      name: "John Doe",
      theme: "In the past",
      startTime: start.toISOString(),
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("POST /api/meets — rejects a slot outside the 14-day window", async () => {
    const res = await request.post("/api/meets").send({
      eventTypeId,
      name: "Too Far",
      theme: "Beyond window",
      startTime: daysFromNow(20),
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("GET /api/meets — lists all meets", async () => {
    const res = await request.get("/api/meets");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /api/meets — filters by status", async () => {
    const res = await request.get("/api/meets?status=confirmed");
    expect(res.status).toBe(200);
    res.body.forEach((meet: { status: string }) => {
      expect(meet.status).toBe("confirmed");
    });
  });

  it("GET /api/meets — filters by date", async () => {
    const tuesday = nextWeekday(2);
    const created = await request.post("/api/meets").send({
      eventTypeId,
      name: "Tuesday Guest",
      theme: "Tuesday meeting",
      startTime: atHour(tuesday, 10),
    });
    expect(created.status).toBe(201);

    const res = await request.get(`/api/meets?date=${toDateStr(monday)}`);
    expect(res.status).toBe(200);
    const tuesdayMeets = res.body.filter((meet: { id: number }) => meet.id === created.body.id);
    expect(tuesdayMeets).toEqual([]);
  });

  it("GET /api/meets/:id — returns the meet", async () => {
    const res = await request.get(`/api/meets/${meetId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(meetId);
  });

  it("GET /api/meets/:id — returns 404 for a non-existent meet", async () => {
    const res = await request.get("/api/meets/999999");
    expect(res.status).toBe(404);
  });

  it("PATCH /api/meets/:id — cancels the meet", async () => {
    const res = await request
      .patch(`/api/meets/${meetId}`)
      .send({ status: "cancelled" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  it("PATCH /api/meets/:id — re-confirms a cancelled meet when the slot is free", async () => {
    const res = await request
      .patch(`/api/meets/${meetId}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("PATCH /api/meets/:id — rejects re-confirmation when the slot is taken", async () => {
    const slotStart = atHour(monday, 15);

    const createdFirst = await request.post("/api/meets").send({
      eventTypeId,
      name: "Alpha",
      theme: "First booking",
      startTime: slotStart,
    });
    expect(createdFirst.status).toBe(201);

    const createdSecond = await request.post("/api/meets").send({
      eventTypeId,
      name: "Beta",
      theme: "Second booking",
      startTime: atHour(monday, 16),
    });
    expect(createdSecond.status).toBe(201);

    const cancelled = await request
      .patch(`/api/meets/${createdSecond.body.id}`)
      .send({ status: "cancelled" });
    expect(cancelled.status).toBe(200);

    const createdThird = await request.post("/api/meets").send({
      eventTypeId,
      name: "Gamma",
      theme: "Third booking",
      startTime: atHour(monday, 16),
    });
    expect(createdThird.status).toBe(201);

    const res = await request
      .patch(`/api/meets/${createdSecond.body.id}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("SLOT_TAKEN");
  });
});
