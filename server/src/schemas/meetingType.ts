import { z } from "zod";

export const meetingTypeInputSchema = z.object({
  duration: z.union([z.literal(15), z.literal(30)]),
  category: z.enum(["single", "group", "private"]),
});
