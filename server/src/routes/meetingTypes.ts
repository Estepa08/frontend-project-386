import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { meetingTypePatchSchema } from "../schemas/meetingType.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(meetingTypePatchSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.meetingType.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Meeting type not found", 404);
    }
    if (existing.adminId !== req.user!.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    const data: any = {};
    if (req.body.duration !== undefined) data.duration = req.body.duration;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.visible !== undefined) data.visible = req.body.visible;
    if (req.body.allowGuestInvite !== undefined) data.allowGuestInvite = req.body.allowGuestInvite;
    const updated = await prisma.meetingType.update({
      where: { id },
      data,
    });
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.meetingType.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Meeting type not found", 404);
    }
    if (existing.adminId !== req.user!.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    await prisma.meetingType.delete({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
