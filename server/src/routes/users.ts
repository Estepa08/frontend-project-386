import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hash } from "../lib/password.js";
import { validate } from "../middleware/validate.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { userCreateSchema, userPatchSchema } from "../schemas/user.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

function excludePassword(user: any) {
  const { password, ...rest } = user;
  return rest;
}

router.post(
  "/",
  validate(userCreateSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("EMAIL_EXISTS", "User with this email already exists", 409);
    }
    const passwordHash = await hash(password);
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
    });
    res.status(201).json(excludePassword(user));
  }),
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json(users.map(excludePassword));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      throw new AppError("NOT_FOUND", "User not found", 404);
    }
    res.json(excludePassword(user));
  }),
);

router.patch(
  "/:id",
  authenticate,
  authorize("user"),
  validate(userPatchSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user!.id !== req.params.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      throw new AppError("NOT_FOUND", "User not found", 404);
    }
    const data: any = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (existing && existing.id !== req.params.id) {
        throw new AppError("EMAIL_EXISTS", "User with this email already exists", 409);
      }
      data.email = req.body.email;
    }
    if (req.body.password !== undefined) data.password = await hash(req.body.password);
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });
    res.json(excludePassword(updated));
  }),
);

router.delete(
  "/:id",
  authenticate,
  authorize("user"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user!.id !== req.params.id) {
      throw new AppError("FORBIDDEN", "Not your resource", 403);
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      throw new AppError("NOT_FOUND", "User not found", 404);
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

router.get(
  "/:id/meets",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      throw new AppError("NOT_FOUND", "User not found", 404);
    }
    const where: any = { userId: req.params.id };
    if (req.query.status) where.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date + "T00:00:00Z");
      where.startTime = { gte: d };
      where.endTime = { lte: new Date(d.getTime() + 86400000) };
    }
    const meets = await prisma.meet.findMany({
      where,
      include: { admin: { select: { id: true, name: true, email: true } } },
    });
    res.json(meets);
  }),
);

export default router;
