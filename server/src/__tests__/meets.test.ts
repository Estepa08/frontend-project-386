import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { describeIfDb, uniqueId } from "./helpers.js";

const request = supertest(app);
const uid = uniqueId();

describeIfDb("Meets API", () => {
  let adminId: string;
  let adminToken: string;
  let userId: string;
  let userToken: string;
  let meetingTypeId: number;
  let meetId: number;

  beforeAll(async () => {
    const adminRes = await request.post("/api/admins").send({
      name: "Meet Admin",
      email: `meetadmin-${uid}@example.com`,
      password: "password123",
    });
    adminId = adminRes.body.id;

    const adminLoginRes = await request
      .post("/api/auth/login")
      .send({ email: `meetadmin-${uid}@example.com`, password: "password123" });
    adminToken = adminLoginRes.body.token;

    const userRes = await request.post("/api/users").send({
      name: "Meet User",
      email: `meetuser-${uid}@example.com`,
      password: "password123",
    });
    userId = userRes.body.id;

    const userLoginRes = await request
      .post("/api/auth/login")
      .send({ email: `meetuser-${uid}@example.com`, password: "password123" });
    userToken = userLoginRes.body.token;

    const mtRes = await request
      .post(`/api/admins/${adminId}/meeting-types`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ duration: 15, category: "single" });
    meetingTypeId = mtRes.body.id;
  });

  it("POST /api/meets — creates a meet", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const res = await request
      .post("/api/meets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        adminId,
        userId,
        meetingTypeId,
        startTime: tomorrow.toISOString(),
        endTime: new Date(tomorrow.getTime() + 15 * 60000).toISOString(),
        theme: "Test meeting",
      });
    expect(res.status).toBe(201);
    expect(res.body.theme).toBe("Test meeting");
    expect(res.body.status).toBe("confirmed");
    expect(res.body.inviteLink).toBeDefined();
    meetId = res.body.id;
  });

  it("POST /api/meets — rejects overlapping slots", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const res = await request
      .post("/api/meets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        adminId,
        userId,
        meetingTypeId,
        startTime: tomorrow.toISOString(),
        endTime: new Date(tomorrow.getTime() + 15 * 60000).toISOString(),
        theme: "Overlapping meet",
      });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("SLOT_TAKEN");
  });

  it("GET /api/meets/:id — returns meet details", async () => {
    const res = await request.get(`/api/meets/${meetId}`);
    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("Test meeting");
    expect(res.body.admin).toBeDefined();
    expect(res.body.user).toBeDefined();
  });

  it("GET /api/meets/:id — returns 404 for non-existent id", async () => {
    const res = await request.get("/api/meets/999999");
    expect(res.status).toBe(404);
  });

  it("PATCH /api/meets/:id — cancels a meet", async () => {
    const res = await request
      .patch(`/api/meets/${meetId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "cancelled" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  it("GET /api/admins/:id/meets — lists admin meets", async () => {
    const res = await request.get(`/api/admins/${adminId}/meets`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/admins/:id/meets — filters by status", async () => {
    const res = await request.get(`/api/admins/${adminId}/meets?status=cancelled`);
    expect(res.status).toBe(200);
    res.body.forEach((m: any) => {
      expect(m.status).toBe("cancelled");
    });
  });
});
