import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

const DEFAULT_DURATIONS = ["15", "30"];

describe("Availability API", () => {
  it("GET /api/availability — returns empty working hours and default durations", async () => {
    const res = await request.get("/api/availability");
    expect(res.status).toBe(200);
    expect(res.body.workingHours).toEqual([]);
    expect(res.body.slotDurations).toEqual(DEFAULT_DURATIONS);
  });

  it("PUT /api/availability — saves working hours and durations", async () => {
    const res = await request.put("/api/availability").send({
      workingHours: [
        { dayOfWeek: "mon", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "tue", startTime: "09:00", endTime: "18:00" },
      ],
      slotDurations: ["15"],
    });
    expect(res.status).toBe(200);
    expect(res.body.workingHours).toHaveLength(2);
    expect(res.body.slotDurations).toEqual(["15"]);
  });

  it("GET /api/availability — returns saved working hours and durations", async () => {
    const res = await request.get("/api/availability");
    expect(res.status).toBe(200);
    expect(res.body.workingHours).toHaveLength(2);
    expect(res.body.workingHours[0]).toMatchObject({ dayOfWeek: "mon" });
    expect(res.body.slotDurations).toEqual(["15"]);
  });

  it("PUT /api/availability — rejects an invalid day", async () => {
    const res = await request.put("/api/availability").send({
      workingHours: [{ dayOfWeek: "monday", startTime: "09:00", endTime: "18:00" }],
      slotDurations: DEFAULT_DURATIONS,
    });
    expect(res.status).toBe(400);
  });

  it("PUT /api/availability — rejects empty slot durations", async () => {
    const res = await request.put("/api/availability").send({
      workingHours: [],
      slotDurations: [],
    });
    expect(res.status).toBe(400);
  });

  it("PUT /api/availability — rejects invalid slot durations", async () => {
    const res = await request.put("/api/availability").send({
      workingHours: [],
      slotDurations: ["45"],
    });
    expect(res.status).toBe(400);
  });
});
