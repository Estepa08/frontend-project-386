import { http, HttpResponse } from "msw";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request: req }) => {
    const body = (await req.json()) as { email: string; password: string };

    if (body.email.includes("admin")) {
      return HttpResponse.json({
        token: "mock-jwt-admin",
        user: {
          id: "1",
          name: "Admin",
          email: body.email,
          createdAt: new Date().toISOString(),
        },
        role: "admin" as const,
      });
    }

    return HttpResponse.json({
      token: "mock-jwt-user",
      user: {
        id: "2",
        name: "User",
        email: body.email,
        createdAt: new Date().toISOString(),
      },
      role: "user" as const,
    });
  }),

  http.post("/api/admins", () => {
    return HttpResponse.json({
      id: "1",
      name: "Admin",
      email: "admin@meetly.app",
      createdAt: new Date().toISOString(),
    });
  }),

  http.post("/api/users", () => {
    return HttpResponse.json({
      id: "2",
      name: "User",
      email: "user@meetly.app",
      createdAt: new Date().toISOString(),
    });
  }),
];
