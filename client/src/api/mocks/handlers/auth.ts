import { http, HttpResponse } from "msw";

export const authHandlers = [
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
