import { http, HttpResponse } from "msw";
import { meetingTypes, type MeetType } from "../data";

export const meetingTypesHandlers = [
  http.get("/api/admins/:id/meeting-types", () => {
    return HttpResponse.json(meetingTypes);
  }),

  http.post("/api/admins/:id/meeting-types", async ({ request }) => {
    const body = (await request.json()) as { duration: number; category: string };

    const duplicate = meetingTypes.find(
      (t) => t.duration === body.duration && t.category === body.category,
    );
    if (duplicate) {
      return HttpResponse.json(
        { error: { code: "DUPLICATE", message: "Такой тип встречи уже существует" } },
        { status: 409 },
      );
    }

    const newType: MeetType = {
      id: meetingTypes.length + 1,
      adminId: "1",
      duration: body.duration as 15 | 30,
      category: body.category as "single" | "group" | "private",
      visible: true,
      allowGuestInvite: false,
    };
    meetingTypes.push(newType);
    return HttpResponse.json(newType, { status: 201 });
  }),

  http.patch("/api/meeting-types/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<MeetType>;
    const index = meetingTypes.findIndex((typeItem) => typeItem.id === Number(params.id));
    if (index === -1) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }
    meetingTypes[index] = { ...meetingTypes[index], ...body };
    return HttpResponse.json(meetingTypes[index]);
  }),

  http.delete("/api/meeting-types/:id", ({ params }) => {
    const index = meetingTypes.findIndex((typeItem) => typeItem.id === Number(params.id));
    if (index !== -1) meetingTypes.splice(index, 1);
    return HttpResponse.json(null, { status: 204 });
  }),
];
