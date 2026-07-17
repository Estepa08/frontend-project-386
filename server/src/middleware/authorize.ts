import type { Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";
import type { AuthRequest } from "./auth.js";

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("FORBIDDEN", "Insufficient permissions", 403);
    }
    next();
  };
}
