import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface JwtPayload {
  id: string;
  role: "admin" | "user";
}

export function sign(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
}

export function verify(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

export function verifyRole(token: string, role: "admin" | "user"): JwtPayload {
  const payload = verify(token);
  if (payload.role !== role) {
    throw new Error("Forbidden: insufficient role");
  }
  return payload;
}
