import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { meetingTypeInputSchema } from "../schemas/meetingType.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.patch(
  "/:id",
  validate(meetingTypeInputSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.meetingType.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Meeting type not found", 404);
    }
    const updated = await prisma.meetingType.update({
      where: { id },
      data: {
        duration: req.body.duration,
        category: req.body.category,
      },
    });
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.meetingType.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Meeting type not found", 404);
    }
    await prisma.meetingType.delete({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
