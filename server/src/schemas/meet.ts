import { z } from "zod";

export const meetInputSchema = z
  .object({
    name: z.string().min(1, "Укажите ваше имя"),
    email: z.string().email("Некорректный email").optional().or(z.literal("")),
    theme: z.string().min(1, "Укажите тему встречи"),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .refine((input) => new Date(input.endTime) > new Date(input.startTime), {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export const meetPatchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  theme: z.string().min(1).optional(),
  status: z.enum(["confirmed", "cancelled"]).optional(),
});
