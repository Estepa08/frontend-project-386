import { Router } from "express";
import { memoryStore } from "../lib/memory-store.js";
import { validate } from "../middleware/validate.js";
import { availabilitySchema } from "../schemas/availability.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getSlotDurations, setSlotDurations, type SlotDuration } from "../services/settings.js";
import { z } from "zod";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const workingHours = await memoryStore.workingHour.findMany({
      select: { dayOfWeek: true, startTime: true, endTime: true },
    });
    const slotDurations = await getSlotDurations();
    res.json({ workingHours, slotDurations });
  }),
);

router.put(
  "/",
  validate(availabilitySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof availabilitySchema>;
    await memoryStore.workingHour.deleteMany({ where: {} });
    await memoryStore.workingHour.createMany({
      data: body.workingHours.map((wh) => ({
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
      })),
    });
    await setSlotDurations(body.slotDurations as SlotDuration[]);
    res.json({
      workingHours: body.workingHours,
      slotDurations: body.slotDurations,
    });
  }),
);

export default router;
