import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { describeIfDb, uniqueId } from "./helpers.js";

const request = supertest(app);
const uid = uniqueId();

describeIfDb("Users API", () => {
  let userId: string;
  let token: string;
  const email = `testuser-${uid}@example.com`;

  it("POST /api/users — creates a new user", async () => {
    const res = await request.post("/api/users").send({
      name: "Test User",
      email,
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test User");
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty("password");
    userId = res.body.id;
  });

  it("POST /api/users — rejects duplicate email", async () => {
    const res = await request.post("/api/users").send({
      name: "Test User 2",
      email,
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_EXISTS");
  });

  it("GET /api/users — lists all users", async () => {
    const res = await request.get("/api/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: any) => u.email === email)).toBe(true);
  });

  it("GET /api/users/:id — returns user by id", async () => {
    const res = await request.get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });

  it("GET /api/users/:id — returns 404 for non-existent id", async () => {
    const res = await request.get("/api/users/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("PATCH /api/users/:id — updates user", async () => {
    const loginRes = await request
      .post("/api/auth/login")
      .send({ email, password: "password123" });
    token = loginRes.body.token;

    const res = await request
      .patch(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated User" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated User");
  });

  it("DELETE /api/users/:id — deletes user", async () => {
    const res = await request
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
