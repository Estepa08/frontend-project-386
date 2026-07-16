import { http, HttpResponse } from "msw";
import { meets } from "../data";

function enrichMeet(meet: (typeof meets)[number]) {
  return {
    ...meet,
    adminName: "Иван Петров",
    userName: meet.userId === "2" ? "User" : "Анна Клиент",
  };
}

function filterMeets(
  list: typeof meets,
  url: URL,
) {
  const status = url.searchParams.get("status");
  const date = url.searchParams.get("date");

  return list.filter((meet) => {
    if (status && meet.status !== status) return false;
    if (date && !meet.startTime.startsWith(date)) return false;
    return true;
  });
}

export const meetsHandlers = [
  http.get("/api/admins/:id/meets", ({ request }) => {
    const url = new URL(request.url);
    const filtered = filterMeets(meets, url);
    return HttpResponse.json(filtered.map(enrichMeet));
  }),

  http.get("/api/users/:id/meets", ({ request }) => {
    const url = new URL(request.url);
    const filtered = filterMeets(meets, url);
    return HttpResponse.json(filtered.map(enrichMeet));
  }),

  http.get("/api/meets/:id", ({ params }) => {
    const meet = meets.find((meetItem) => meetItem.id === Number(params.id));
    if (!meet) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(enrichMeet(meet));
  }),

  http.patch("/api/meets/:id", async ({ params, request }) => {
    const body = (await request.json()) as { status: "confirmed" | "cancelled" };
    const meet = meets.find((meetItem) => meetItem.id === Number(params.id));
    if (meet) {
      meet.status = body.status;
      meet.updatedAt = new Date().toISOString();
    }
    return HttpResponse.json(meet ? enrichMeet(meet) : null);
  }),
];
