import type { Request, Response, NextFunction } from "express";
import { verify } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

export interface AuthRequest extends Request {
  user?: { id: string; role: "admin" | "user" };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    throw new AppError("UNAUTHORIZED", "Missing or invalid token", 401);
  }
  try {
    req.user = verify(token);
    next();
  } catch {
    throw new AppError("UNAUTHORIZED", "Invalid or expired token", 401);
  }
}
