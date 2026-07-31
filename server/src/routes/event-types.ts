import { Router } from "express";
import { memoryStore } from "../lib/memory-store.js";
import { validate } from "../middleware/validate.js";
import { eventTypeInputSchema } from "../schemas/event-type.js";
import { getAvailableDatesInWindow, getSlots } from "../services/slots.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { z } from "zod";

const router = Router();

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("VALIDATION", "Invalid event type id", 400);
  }
  return id;
}

async function requireEventType(eventTypeId: number) {
  const eventType = await memoryStore.eventType.findUnique({ where: { id: eventTypeId } });
  if (!eventType) {
    throw new AppError("NOT_FOUND", "Event type not found", 404);
  }
  return eventType;
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const eventTypes = await memoryStore.eventType.findMany({});
    res.json(eventTypes);
  }),
);

router.post(
  "/",
  validate(eventTypeInputSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof eventTypeInputSchema>;
    const eventType = await memoryStore.eventType.create({
      data: {
        title: body.title,
        description: body.description,
        durationMinutes: body.durationMinutes,
      },
    });
    res.status(201).json(eventType);
  }),
);

router.get(
  "/:eventTypeId/available-dates",
  asyncHandler(async (req, res) => {
    const eventTypeId = parseId(req.params.eventTypeId);
    const eventType = await requireEventType(eventTypeId);
    const dates = await getAvailableDatesInWindow(eventTypeId, eventType.durationMinutes as number);
    res.json({ dates });
  }),
);

router.get(
  "/:eventTypeId/slots",
  asyncHandler(async (req, res) => {
    const eventTypeId = parseId(req.params.eventTypeId);
    const eventType = await requireEventType(eventTypeId);
    const date = req.query.date as string;
    const slots = await getSlots(date, eventType.durationMinutes as number);
    res.json({ slots });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const eventType = await requireEventType(id);
    res.json(eventType);
  }),
);

router.patch(
  "/:id",
  validate(eventTypeInputSchema),
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await requireEventType(id);
    const body = req.body as z.infer<typeof eventTypeInputSchema>;
    const updated = await memoryStore.eventType.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        durationMinutes: body.durationMinutes,
      },
    });
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await requireEventType(id);
    const hasConfirmedMeets = await memoryStore.meet.findFirst({
      where: { eventTypeId: id, status: "confirmed" },
    });
    if (hasConfirmedMeets) {
      throw new AppError("EVENT_TYPE_IN_USE", "Cannot delete event type with confirmed meetings", 409);
    }
    await memoryStore.eventType.deleteMany({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
