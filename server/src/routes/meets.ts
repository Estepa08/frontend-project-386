import { Router } from "express";
import crypto from "crypto";
import { memoryStore } from "../lib/memory-store.js";
import { validate } from "../middleware/validate.js";
import { meetInputSchema, meetPatchSchema } from "../schemas/meet.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { z } from "zod";

const router = Router();

function generateInviteLink(): string {
  return crypto.randomUUID();
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.date) {
      const d = new Date((req.query.date as string) + "T00:00:00Z");
      where.startTime = { gte: d };
      where.endTime = { lte: new Date(d.getTime() + 86400000) };
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
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

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

    const meet = await memoryStore.meet.create({
      data: {
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

    const updated = await memoryStore.meet.update({ where: { id }, data });
    res.json(updated);
  }),
);

export default router;
