import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { sign } from "../lib/jwt.js";
import { compare } from "../lib/password.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../schemas/auth.js";
import { AppError } from "../lib/errors.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      const passwordValid = await compare(password, admin.password);
      if (!passwordValid) {
        throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);
      }
      const token = sign({ id: admin.id, role: "admin" });
      res.json({
        token,
        role: "admin",
        user: { id: admin.id, name: admin.name, email: admin.email, createdAt: admin.createdAt },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const passwordValid = await compare(password, user.password);
      if (!passwordValid) {
        throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);
      }
      const token = sign({ id: user.id, role: "user" });
      res.json({
        token,
        role: "user",
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
      return;
    }

    throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }),
);

export default router;
