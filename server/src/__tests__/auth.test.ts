import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { describeIfDb } from "./helpers.js";

const request = supertest(app);

describe("POST /api/auth/login — validation", () => {
  it("returns 400 for invalid email format", async () => {
    const res = await request
      .post("/api/auth/login")
      .send({ email: "notanemail", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for missing password", async () => {
    const res = await request
      .post("/api/auth/login")
      .send({ email: "alice@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describeIfDb("POST /api/auth/login — integration", () => {
  it("returns 401 for non-existent email", async () => {
    const res = await request
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for wrong password", async () => {
    const res = await request
      .post("/api/auth/login")
      .send({ email: "alice@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});
