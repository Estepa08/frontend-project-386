import { z } from "zod";

export const bookingFormSchema = z.object({
  theme: z.string().min(1, "Укажите тему встречи"),
  comment: z.string().optional(),
  guests: z.array(z.string().email("Некорректный email").or(z.literal(""))),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  single: "Single",
  group: "Group",
  private: "Private",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
