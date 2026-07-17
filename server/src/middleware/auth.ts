import type { Request, Response, NextFunction } from "express";
import { verify } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

export interface AuthRequest extends Request {
  user?: { id: string; role: "admin" | "user" };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", "Missing or invalid token", 401);
  }
  const token = header.slice(7);
  try {
    req.user = verify(token);
    next();
  } catch {
    throw new AppError("UNAUTHORIZED", "Invalid or expired token", 401);
  }
}
