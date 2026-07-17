import { Router } from "express";
import authRouter from "./auth.js";
import adminsRouter from "./admins.js";
import meetingTypesRouter from "./meetingTypes.js";
import usersRouter from "./users.js";
import meetsRouter from "./meets.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/admins", adminsRouter);
router.use("/meeting-types", meetingTypesRouter);
router.use("/users", usersRouter);
router.use("/meets", meetsRouter);

export default router;
