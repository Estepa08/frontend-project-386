import crypto from "node:crypto";
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex"),
  databaseUrl: process.env.DATABASE_URL || "",
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  isDbAvailable: !!process.env.DATABASE_URL,
};
