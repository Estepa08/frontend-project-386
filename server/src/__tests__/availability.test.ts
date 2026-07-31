import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

const DEFAULT_WORKING_DAYS = ["mon", "tue", "wed", "thu", "fri"];

describe("Availability API", () => {
  it("GET /api/availability — returns default working hours", async () => {
    const res = await request.get("/api/availability");
    expect(res.status).toBe(200);
    expect(res.body.workingHours).toHaveLength(DEFAULT_WORKING_DAYS.length);
    expect(res.body.workingHours.map((wh: { dayOfWeek: string }) => wh.dayOfWeek)).toEqual(
      DEFAULT_WORKING_DAYS,
    );
    expect(res.body.slotDurations).toBeUndefined();
  });

  it("PUT /api/availability — saves working hours", async () => {
    const res = await request.put("/api/availability").send({
      workingHours: [
        { dayOfWeek: "mon", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "tue", startTime: "09:00", endTime: "18:00" },
      ],
    });
    expect(res.status).toBe(200);
    expect(res.body.workingHours).toHaveLength(2);
  });

  it("GET /api/availability — returns saved working hours", async () => {
    const res = await request.get("/api/availability");
    expect(res.status).toBe(200);
    expect(res.body.workingHours).toHaveLength(2);
    expect(res.body.workingHours[0]).toMatchObject({ dayOfWeek: "mon" });
  });

  it("PUT /api/availability — rejects an invalid day", async () => {
    const res = await request.put("/api/availability").send({
      workingHours: [{ dayOfWeek: "monday", startTime: "09:00", endTime: "18:00" }],
    });
    expect(res.status).toBe(400);
  });
});
