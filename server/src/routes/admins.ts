import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hash } from "../lib/password.js";
import { validate } from "../middleware/validate.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { adminCreateSchema, adminPatchSchema } from "../schemas/admin.js";
import { availabilitySchema } from "../schemas/availability.js";
import { meetingTypeInputSchema } from "../schemas/meetingType.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getAvailableDates, getSlots } from "../services/slots.js";

const router = Router();

function excludePassword(admin: any) {
  const { password, ...rest } = admin;
  return rest;
}

router.post(
  "/",
  validate(adminCreateSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("EMAIL_EXISTS", "Admin with this email already exists", 409);
    }
    const passwordHash = await hash(password);
    const admin = await prisma.admin.create({
      data: { name, email, password: passwordHash },
    });
    res.status(201).json(excludePassword(admin));
  }),
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const admins = await prisma.admin.findMany();
    res.json(admins.map(excludePassword));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    res.json(excludePassword(admin));
  }),
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(adminPatchSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user!.id !== req.params.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    const data: any = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.email !== undefined) {
      const existing = await prisma.admin.findUnique({ where: { email: req.body.email } });
      if (existing && existing.id !== req.params.id) {
        throw new AppError("EMAIL_EXISTS", "Admin with this email already exists", 409);
      }
      data.email = req.body.email;
    }
    if (req.body.password !== undefined) data.password = await hash(req.body.password);
    const updated = await prisma.admin.update({
      where: { id: req.params.id },
      data,
    });
    res.json(excludePassword(updated));
  }),
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user!.id !== req.params.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    await prisma.admin.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

router.get(
  "/:id/availability",
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    const workingHours = await prisma.workingHour.findMany({
      where: { adminId: req.params.id },
      select: { dayOfWeek: true, startTime: true, endTime: true },
    });
    res.json({ workingHours });
  }),
);

router.put(
  "/:id/availability",
  authenticate,
  validate(availabilitySchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const adminId = req.params.id;
    if (req.user?.id !== adminId && req.user?.role !== "admin") {
      throw new AppError("FORBIDDEN", "Not authorized to modify this schedule", 403);
    }
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    await prisma.workingHour.deleteMany({ where: { adminId } });
    await prisma.workingHour.createMany({
      data: req.body.workingHours.map((wh: any) => ({
        adminId,
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
      })),
    });
    res.json({ workingHours: req.body.workingHours });
  }),
);

router.get(
  "/:id/available-dates",
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    const month = req.query.month as string;
    const meetingTypeId = req.query.meetingTypeId ? Number(req.query.meetingTypeId) : undefined;
    const dates = await getAvailableDates(req.params.id, month, meetingTypeId);
    res.json({ dates });
  }),
);

router.get(
  "/:id/slots",
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    const date = req.query.date as string;
    const meetingTypeId = req.query.meetingTypeId ? Number(req.query.meetingTypeId) : undefined;
    const slots = await getSlots(req.params.id, date, meetingTypeId);
    res.json({ slots });
  }),
);

router.get(
  "/:id/meets",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user!.id !== req.params.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    const where: any = { adminId: req.params.id };
    if (req.query.status) where.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date + "T00:00:00Z");
      where.startTime = { gte: d };
      where.endTime = { lte: new Date(d.getTime() + 86400000) };
    }
    const meets = await prisma.meet.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(meets);
  }),
);

router.post(
  "/:id/meeting-types",
  authenticate,
  authorize("admin"),
  validate(meetingTypeInputSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user!.id !== req.params.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    const meetingType = await prisma.meetingType.create({
      data: {
        adminId: req.params.id,
        duration: req.body.duration,
        category: req.body.category,
      },
    });
    res.status(201).json(meetingType);
  }),
);

router.get(
  "/:id/meeting-types",
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      throw new AppError("NOT_FOUND", "Admin not found", 404);
    }
    const meetingTypes = await prisma.meetingType.findMany({
      where: { adminId: req.params.id },
    });
    res.json(meetingTypes);
  }),
);

export default router;
