import { beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma.js";

let dbAvailable = false;

export function isDbAvailable(): boolean {
  return dbAvailable;
}

beforeAll(async () => {
  try {
    await prisma.$connect();
    dbAvailable = true;
  } catch {
    console.warn("DB not available — skipping integration tests");
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
});
