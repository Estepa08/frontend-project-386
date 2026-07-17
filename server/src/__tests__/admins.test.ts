import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { describeIfDb, uniqueId } from "./helpers.js";

const request = supertest(app);

const uid = uniqueId();

describeIfDb("Admins API", () => {
  let adminId: string;
  let token: string;
  const email = `testadmin-${uid}@example.com`;

  it("POST /api/admins — creates a new admin", async () => {
    const res = await request.post("/api/admins").send({
      name: "Test Admin",
      email,
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Admin");
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty("password");
    adminId = res.body.id;
  });

  it("POST /api/admins — rejects duplicate email", async () => {
    const res = await request.post("/api/admins").send({
      name: "Test Admin 2",
      email,
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_EXISTS");
  });

  it("GET /api/admins — lists all admins", async () => {
    const res = await request.get("/api/admins");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: any) => a.email === email)).toBe(true);
  });

  it("GET /api/admins/:id — returns admin by id", async () => {
    const res = await request.get(`/api/admins/${adminId}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });

  it("GET /api/admins/:id — returns 404 for non-existent id", async () => {
    const res = await request.get("/api/admins/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("PATCH /api/admins/:id — updates admin", async () => {
    const loginRes = await request
      .post("/api/auth/login")
      .send({ email, password: "password123" });
    token = loginRes.body.token;

    const res = await request
      .patch(`/api/admins/${adminId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Admin" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Admin");
  });

  it("DELETE /api/admins/:id — deletes admin", async () => {
    const res = await request
      .delete(`/api/admins/${adminId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  describe("Availability", () => {
    let targetAdminId: string;
    const availEmail = `availability-${uid}@example.com`;

    beforeAll(async () => {
      const res = await request.post("/api/admins").send({
        name: "Availability Admin",
        email: availEmail,
        password: "password123",
      });
      targetAdminId = res.body.id;
    });

    it("GET /api/admins/:id/availability — returns empty working hours", async () => {
      const res = await request.get(`/api/admins/${targetAdminId}/availability`);
      expect(res.status).toBe(200);
      expect(res.body.workingHours).toEqual([]);
    });

    it("PUT /api/admins/:id/availability — sets working hours", async () => {
      const loginRes = await request
        .post("/api/auth/login")
        .send({ email: availEmail, password: "password123" });
      const t = loginRes.body.token;

      const res = await request
        .put(`/api/admins/${targetAdminId}/availability`)
        .set("Authorization", `Bearer ${t}`)
        .send({
          workingHours: [
            { dayOfWeek: "mon", startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: "wed", startTime: "09:00", endTime: "18:00" },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.workingHours).toHaveLength(2);
    });
  });

  describe("Meeting Types", () => {
    let targetAdminId: string;
    let adminToken: string;
    const mtEmail = `mtadmin-${uid}@example.com`;

    beforeAll(async () => {
      const res = await request.post("/api/admins").send({
        name: "MT Admin",
        email: mtEmail,
        password: "password123",
      });
      targetAdminId = res.body.id;

      const loginRes = await request
        .post("/api/auth/login")
        .send({ email: mtEmail, password: "password123" });
      adminToken = loginRes.body.token;
    });

    it("POST /api/admins/:id/meeting-types — creates meeting type", async () => {
      const res = await request
        .post(`/api/admins/${targetAdminId}/meeting-types`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ duration: 30, category: "group" });
      expect(res.status).toBe(201);
      expect(res.body.duration).toBe(30);
      expect(res.body.category).toBe("group");
    });

    it("GET /api/admins/:id/meeting-types — lists meeting types", async () => {
      const res = await request.get(`/api/admins/${targetAdminId}/meeting-types`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
