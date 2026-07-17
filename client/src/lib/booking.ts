import { z } from "zod";
import { CATEGORY_LABELS } from "@/lib/constants";

export const bookingFormSchema = z.object({
  theme: z.string().min(1, "Укажите тему встречи"),
  comment: z.string().optional(),
  guests: z.array(z.string().email("Некорректный email").or(z.literal(""))),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category;
}
