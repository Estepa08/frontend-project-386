import { http, HttpResponse } from "msw";
import { workingHours } from "../data";

export const availabilityHandlers = [
  http.get("/api/admins/:id/availability", () => {
    return HttpResponse.json({ workingHours });
  }),

  http.put("/api/admins/:id/availability", async ({ request }) => {
    const body = (await request.json()) as { workingHours: typeof workingHours };
    workingHours.length = 0;
    workingHours.push(...body.workingHours);
    return HttpResponse.json({ workingHours });
  }),
];
