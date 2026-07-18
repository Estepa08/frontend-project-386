import { PrismaClient } from "@prisma/client";
import { config } from "../config.js";

export const prisma: PrismaClient = config.isDbAvailable
  ? new PrismaClient()
  : (null as unknown as PrismaClient);
