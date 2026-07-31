import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

function tomorrowAt(hour: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date;
}

describe("Meets API", () => {
  let meetId: number;

  it("POST /api/meets — creates a meet", async () => {
    const start = tomorrowAt(10);
    const res = await request.post("/api/meets").send({
      name: "John Doe",
      email: "john@example.com",
      theme: "Consultation",
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + 30 * 60000).toISOString(),
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("John Doe");
    expect(res.body.theme).toBe("Consultation");
    expect(res.body.status).toBe("confirmed");
    expect(res.body.inviteLink).toBeDefined();
    meetId = res.body.id;
  });

  it("POST /api/meets — rejects an overlapping slot", async () => {
    const start = tomorrowAt(10);
    const res = await request.post("/api/meets").send({
      name: "Jane Smith",
      theme: "Overlapping meet",
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + 30 * 60000).toISOString(),
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
});
