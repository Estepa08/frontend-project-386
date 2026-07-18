import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";
import { config } from "../config.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    const message = config.nodeEnv === "production"
      ? "Validation failed"
      : err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
}
