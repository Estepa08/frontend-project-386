import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

function nextWeekday(target: number): Date {
  const now = new Date();
  const daysUntil = (target - now.getDay() + 7) % 7 || 7;
  const date = new Date(now);
  date.setDate(now.getDate() + daysUntil);
  return date;
}

function atHour(day: Date, hour: number): string {
  const date = new Date(day);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

describe("Event Types API", () => {
  beforeAll(async () => {
    const weekdays = ["mon", "tue", "wed", "thu", "fri"].map((dayOfWeek) => ({
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
    }));
    await request.put("/api/availability").send({ workingHours: weekdays });
  });

  it("GET /api/event-types — returns the seeded event types", async () => {
    const res = await request.get("/api/event-types");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("POST /api/event-types — creates an event type", async () => {
    const res = await request.post("/api/event-types").send({
      title: "Консультация",
      description: "Разбор проекта",
      durationMinutes: 45,
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Консультация",
      description: "Разбор проекта",
      durationMinutes: 45,
    });
    expect(res.body.id).toBeDefined();
  });

  it("POST /api/event-types — rejects an invalid duration", async () => {
    const res = await request.post("/api/event-types").send({
      title: "Слишком короткая",
      description: "",
      durationMinutes: 5,
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/event-types — rejects an empty title", async () => {
    const res = await request.post("/api/event-types").send({
      title: "",
      description: "",
      durationMinutes: 30,
    });
    expect(res.status).toBe(400);
  });

  it("PATCH /api/event-types/:id — updates an event type", async () => {
    const created = await request.post("/api/event-types").send({
      title: "Старое название",
      description: "Описание",
      durationMinutes: 30,
    });
    expect(created.status).toBe(201);

    const res = await request.patch(`/api/event-types/${created.body.id}`).send({
      title: "Новое название",
      description: "Новое описание",
      durationMinutes: 60,
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      title: "Новое название",
      description: "Новое описание",
      durationMinutes: 60,
    });
  });

  it("PATCH /api/event-types/:id — returns 404 for an unknown event type", async () => {
    const res = await request.patch("/api/event-types/999999").send({
      title: "X",
      description: "",
      durationMinutes: 30,
    });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/event-types/:id — deletes an unused event type", async () => {
    const created = await request.post("/api/event-types").send({
      title: "Лишний",
      description: "",
      durationMinutes: 30,
    });
    expect(created.status).toBe(201);

    const res = await request.delete(`/api/event-types/${created.body.id}`);
    expect(res.status).toBe(204);

    const getRes = await request.get(`/api/event-types/${created.body.id}`);
    expect(getRes.status).toBe(404);
  });

  it("DELETE /api/event-types/:id — blocks deletion when confirmed meetings exist", async () => {
    const created = await request.post("/api/event-types").send({
      title: "Занятый тип",
      description: "",
      durationMinutes: 30,
    });
    expect(created.status).toBe(201);

    const meetRes = await request.post("/api/meets").send({
      eventTypeId: created.body.id,
      name: "Guest",
      theme: "Забронировано",
      startTime: atHour(nextWeekday(1), 10),
    });
    expect(meetRes.status).toBe(201);

    const res = await request.delete(`/api/event-types/${created.body.id}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EVENT_TYPE_IN_USE");
  });
});
