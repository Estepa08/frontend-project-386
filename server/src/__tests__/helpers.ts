import { describe } from "vitest";
import { isDbAvailable } from "./setup.js";

export function describeIfDb(name: string, fn: () => void) {
  const runIf = isDbAvailable() ? describe : describe.skip;
  runIf(name, fn);
}
