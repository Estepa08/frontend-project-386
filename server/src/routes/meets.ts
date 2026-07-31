import { Router } from "express";
import crypto from "crypto";
import { memoryStore } from "../lib/memory-store.js";
import { validate } from "../middleware/validate.js";
import { meetInputSchema, meetPatchSchema } from "../schemas/meet.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  getSlots,
  getBookingWindowEnd,
  toDateStr,
  toTimeStr,
} from "../services/slots.js";
import { z } from "zod";

const router = Router();

function generateInviteLink(): string {
  return crypto.randomUUID();
}

async function requireEventType(eventTypeId: number) {
  const eventType = await memoryStore.eventType.findUnique({ where: { id: eventTypeId } });
  if (!eventType) {
    throw new AppError("NOT_FOUND", "Event type not found", 404);
  }
  return eventType;
}

function assertWithinBookingWindow(startTime: Date): void {
  if (startTime.getTime() <= Date.now()) {
    throw new AppError("SLOT_UNAVAILABLE", "Selected time is not available for booking", 400);
  }
  if (startTime.getTime() > getBookingWindowEnd().getTime()) {
    throw new AppError("SLOT_UNAVAILABLE", "Selected time is outside the booking window", 400);
  }
}

async function assertSlotBookable(startTime: Date, endTime: Date): Promise<void> {
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
  const slots = await getSlots(toDateStr(startTime), durationMinutes);
  const isBookable = slots.some(
    (slot) => slot.startTime === toTimeStr(startTime) && slot.endTime === toTimeStr(endTime),
  );
  if (!isBookable) {
    throw new AppError("SLOT_UNAVAILABLE", "Selected time is not available for booking", 400);
  }
}

async function hasOverlap(id: number, startTime: Date, endTime: Date): Promise<boolean> {
  const conflicts = await memoryStore.meet.findMany({
    where: {
      status: "confirmed",
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  return conflicts.some((meet) => meet.id !== id);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.date) {
      const dayStart = new Date((req.query.date as string) + "T00:00:00Z");
      dayStart.setHours(0, 0, 0, 0);
      where.startTime = { gte: dayStart };
      where.endTime = { lte: new Date(dayStart.getTime() + 86400000) };
    }
    const meets = await memoryStore.meet.findMany({ where });
    res.json(meets);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const meet = await memoryStore.meet.findUnique({ where: { id } });
    if (!meet) {
      throw new AppError("NOT_FOUND", "Meet not found", 404);
    }
    res.json(meet);
  }),
);

router.post(
  "/",
  validate(meetInputSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof meetInputSchema>;
    const eventType = await requireEventType(body.eventTypeId);
    const startTime = new Date(body.startTime);
    const endTime = new Date(startTime.getTime() + (eventType.durationMinutes as number) * 60000);

    assertWithinBookingWindow(startTime);

    const conflict = await memoryStore.meet.findFirst({
      where: {
        status: "confirmed",
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    if (conflict) {
      throw new AppError("SLOT_TAKEN", "This time slot is already booked", 409);
    }

    await assertSlotBookable(startTime, endTime);

    const meet = await memoryStore.meet.create({
      data: {
        eventTypeId: body.eventTypeId,
        name: body.name,
        email: body.email || undefined,
        theme: body.theme,
        startTime,
        endTime,
        inviteLink: generateInviteLink(),
      },
    });
    res.status(201).json(meet);
  }),
);

router.patch(
  "/:id",
  validate(meetPatchSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await memoryStore.meet.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Meet not found", 404);
    }

    const body = req.body as z.infer<typeof meetPatchSchema>;
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.theme !== undefined) data.theme = body.theme;
    if (body.status !== undefined) data.status = body.status;

    const targetStatus = body.status ?? existing.status;
    if (targetStatus === "confirmed" && existing.status !== "confirmed") {
      const hasConflict = await hasOverlap(id, existing.startTime as Date, existing.endTime as Date);
      if (hasConflict) {
        throw new AppError("SLOT_TAKEN", "This time slot is already booked", 409);
      }
    }

    const updated = await memoryStore.meet.update({ where: { id }, data });
    res.json(updated);
  }),
);

export default router;
