import { Router } from "express";
import availabilityRouter from "./availability.js";
import eventTypesRouter from "./event-types.js";
import meetsRouter from "./meets.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/availability", availabilityRouter);
router.use("/event-types", eventTypesRouter);
router.use("/meets", meetsRouter);

export default router;
