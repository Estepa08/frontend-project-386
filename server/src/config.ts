import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || "meetly-secret-change-in-production",
  databaseUrl: process.env.DATABASE_URL || "",
};
