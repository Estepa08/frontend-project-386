import { afterAll } from "vitest";
import { prisma } from "../lib/prisma.js";

let dbAvailable = false;

try {
  await prisma.$connect();
  dbAvailable = true;
} catch {
  console.warn("DB not available — skipping integration tests");
}

export function isDbAvailable(): boolean {
  return dbAvailable;
}

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
});
