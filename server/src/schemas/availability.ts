import { z } from "zod";

const dayOfWeekSchema = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

const workingHourSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const availabilitySchema = z.object({
  workingHours: z.array(workingHourSchema),
});
