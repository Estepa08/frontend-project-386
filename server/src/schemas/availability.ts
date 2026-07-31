import { z } from "zod";

export const workingHourSchema = z.object({
  dayOfWeek: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const availabilitySchema = z.object({
  workingHours: z.array(workingHourSchema),
});
