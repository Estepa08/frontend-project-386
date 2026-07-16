import { http, HttpResponse } from "msw";
import { meets } from "../data";

export const bookingHandlers = [
  http.get("/api/admins", () => {
    return HttpResponse.json([
      { id: "1", name: "Иван Петров", email: "ivan@petrov.ru" },
      { id: "2", name: "Анна Смирнова", email: "anna@smirnova.ru" },
      { id: "3", name: "Пётр Сидоров", email: "petr@sidorov.ru" },
    ]);
  }),

  http.get("/api/admins/:id/available-dates", () => {
    const now = new Date();
    const dates: string[] = [];
    for (let d = 1; d <= 28; d++) {
      const candidate = new Date(now.getFullYear(), now.getMonth(), d);
      if (candidate.getDay() !== 0 && candidate.getDay() !== 6) {
        dates.push(candidate.toISOString().slice(0, 10));
      }
    }
    return HttpResponse.json({ dates });
  }),

  http.get("/api/admins/:id/slots", () => {
    const slots: { startTime: string; endTime: string }[] = [];
    for (let h = 9; h <= 17; h++) {
      const start = `${String(h).padStart(2, "0")}:00`;
      const end = `${String(h + 1).padStart(2, "0")}:00`;
      slots.push({ startTime: start, endTime: end });
    }
    return HttpResponse.json({ slots });
  }),

  http.post("/api/meets", async ({ request }) => {
    const body = (await request.json()) as {
      adminId: string;
      theme: string;
      startTime: string;
      endTime: string;
      userId: string;
    };
    const newMeet = {
      id: meets.length + 1,
      adminId: body.adminId,
      userId: body.userId,
      meetingTypeId: 1,
      startTime: body.startTime,
      endTime: body.endTime,
      theme: body.theme,
      status: "confirmed",
      inviteLink: "https://meetly.app/invite/xyz789",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    meets.push(newMeet);
    return HttpResponse.json(newMeet, { status: 201 });
  }),
];
