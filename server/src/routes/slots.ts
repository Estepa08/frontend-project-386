import { Router } from "express";
import { getAvailableDates, getSlots } from "../services/slots.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.get(
  "/available-dates",
  asyncHandler(async (req, res) => {
    const month = req.query.month as string;
    const dates = await getAvailableDates(month);
    res.json({ dates });
  }),
);

router.get(
  "/slots",
  asyncHandler(async (req, res) => {
    const date = req.query.date as string;
    const slots = await getSlots(date);
    res.json({ slots });
  }),
);

export default router;
