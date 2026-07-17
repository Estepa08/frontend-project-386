import { z } from "zod";

export const meetInputSchema = z.object({
  adminId: z.string().uuid(),
  userId: z.string().uuid(),
  meetingTypeId: z.number().int(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  theme: z.string().min(1),
  comment: z.string().optional(),
  guestEmails: z.array(z.string().email()).optional(),
});

export const meetPatchSchema = z.object({
  theme: z.string().min(1).optional(),
  comment: z.string().optional(),
  guestEmails: z.array(z.string().email()).optional(),
  status: z.enum(["confirmed", "cancelled"]).optional(),
});
