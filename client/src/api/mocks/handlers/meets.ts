import { http, HttpResponse } from "msw";
import { meets } from "../data";

export const meetsHandlers = [
  http.get("/api/admins/:id/meets", () => {
    return HttpResponse.json(meets);
  }),

  http.patch("/api/meets/:id", async ({ params, request }) => {
    const body = (await request.json()) as { status: string };
    const meet = meets.find((m) => m.id === Number(params.id));
    if (meet) {
      meet.status = body.status;
    }
    return HttpResponse.json(meet);
  }),
];
