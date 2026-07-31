import { Router } from "express";
import availabilityRouter from "./availability.js";
import slotsRouter from "./slots.js";
import meetsRouter from "./meets.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/availability", availabilityRouter);
router.use("/", slotsRouter);
router.use("/meets", meetsRouter);

export default router;
