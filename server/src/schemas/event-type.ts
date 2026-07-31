import { z } from "zod";

export const eventTypeInputSchema = z.object({
  title: z.string().min(1, "Укажите название типа события"),
  description: z.string().default(""),
  durationMinutes: z
    .number()
    .int("Длительность должна быть целым числом минут")
    .min(15, "Минимальная длительность — 15 минут")
    .max(480, "Максимальная длительность — 480 минут"),
});
