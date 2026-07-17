import { z } from "zod";

export const meetingTypeInputSchema = z.object({
  duration: z.union([z.literal(15), z.literal(30)]),
  category: z.enum(["single", "group", "private"]),
});

export const meetingTypePatchSchema = z.object({
  duration: z.union([z.literal(15), z.literal(30)]).optional(),
  category: z.enum(["single", "group", "private"]).optional(),
  visible: z.boolean().optional(),
  allowGuestInvite: z.boolean().optional(),
});
