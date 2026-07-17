import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { describeIfDb } from "./helpers.js";

const request = supertest(app);

describeIfDb("Users API", () => {
  let userId: string;

  it("POST /api/users — creates a new user", async () => {
    const res = await request.post("/api/users").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test User");
    expect(res.body.email).toBe("testuser@example.com");
    expect(res.body).not.toHaveProperty("password");
    userId = res.body.id;
  });

  it("POST /api/users — rejects duplicate email", async () => {
    const res = await request.post("/api/users").send({
      name: "Test User 2",
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_EXISTS");
  });

  it("GET /api/users — lists all users", async () => {
    const res = await request.get("/api/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: any) => u.email === "testuser@example.com")).toBe(true);
  });

  it("GET /api/users/:id — returns user by id", async () => {
    const res = await request.get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("testuser@example.com");
  });

  it("GET /api/users/:id — returns 404 for non-existent id", async () => {
    const res = await request.get("/api/users/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("PATCH /api/users/:id — updates user", async () => {
    const res = await request.patch(`/api/users/${userId}`).send({
      name: "Updated User",
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated User");
  });

  it("DELETE /api/users/:id — deletes user", async () => {
    const res = await request.delete(`/api/users/${userId}`);
    expect(res.status).toBe(204);
  });
});
