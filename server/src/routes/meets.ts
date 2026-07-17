import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { meetInputSchema, meetPatchSchema } from "../schemas/meet.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

function generateInviteLink(): string {
  return crypto.randomUUID();
}

router.post(
  "/",
  authenticate,
  authorize("user"),
  validate(meetInputSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { adminId, userId, meetingTypeId, startTime, endTime, theme, comment, guestEmails } =
      req.body;

    if (userId !== req.user!.id) {
      throw new AppError("FORBIDDEN", "Can only book meetings for yourself", 403);
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError("NOT_FOUND", "Admin not found", 404);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("NOT_FOUND", "User not found", 404);

    const meetingType = await prisma.meetingType.findUnique({ where: { id: meetingTypeId } });
    if (!meetingType) throw new AppError("NOT_FOUND", "Meeting type not found", 404);

    const conflict = await prisma.meet.findFirst({
      where: {
        adminId,
        status: "confirmed",
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    });
    if (conflict) {
      throw new AppError("SLOT_TAKEN", "This time slot is already booked", 409);
    }

    const meet = await prisma.meet.create({
      data: {
        adminId,
        userId,
        meetingTypeId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        theme,
        comment,
        guestEmails: guestEmails || [],
        inviteLink: generateInviteLink(),
      },
    });
    res.status(201).json(meet);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const meet = await prisma.meet.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!meet) {
      throw new AppError("NOT_FOUND", "Meet not found", 404);
    }
    res.json(meet);
  }),
);

router.patch(
  "/:id",
  authenticate,
  validate(meetPatchSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.meet.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Meet not found", 404);
    }
    if (existing.adminId !== req.user!.id && existing.userId !== req.user!.id) {
      throw new AppError("FORBIDDEN", "Not a participant of this meet", 403);
    }
    const data: any = {};
    if (req.body.theme !== undefined) data.theme = req.body.theme;
    if (req.body.comment !== undefined) data.comment = req.body.comment;
    if (req.body.guestEmails !== undefined) data.guestEmails = req.body.guestEmails;
    if (req.body.status !== undefined) data.status = req.body.status;

    const updated = await prisma.meet.update({
      where: { id },
      data,
    });
    res.json(updated);
  }),
);

export default router;
