import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Must contain at least 1 letter and 1 digit"),
});

export const userPatchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Must contain at least 1 letter and 1 digit").optional(),
});
