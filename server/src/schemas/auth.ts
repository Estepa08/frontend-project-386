import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Must contain at least 1 letter and 1 digit"),
});
