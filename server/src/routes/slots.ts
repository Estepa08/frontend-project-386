import { Router } from "express";
import { getAvailableDates, getSlots, type SlotDurationMinutes } from "../services/slots.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/errors.js";

const router = Router();

function parseDuration(raw: unknown): SlotDurationMinutes {
  if (raw === "15" || raw === "30") return Number(raw) as SlotDurationMinutes;
  throw new AppError("VALIDATION", "duration must be \"15\" or \"30\"", 400);
}

router.get(
  "/available-dates",
  asyncHandler(async (req, res) => {
    const month = req.query.month as string;
    const duration = parseDuration(req.query.duration);
    const dates = await getAvailableDates(month, duration);
    res.json({ dates });
  }),
);

router.get(
  "/slots",
  asyncHandler(async (req, res) => {
    const date = req.query.date as string;
    const duration = parseDuration(req.query.duration);
    const slots = await getSlots(date, duration);
    res.json({ slots });
  }),
);

export default router;
