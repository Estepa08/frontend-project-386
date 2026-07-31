import { z } from "zod";

export const bookingFormSchema = z.object({
  name: z.string().min(1, "Укажите ваше имя"),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  theme: z.string().min(1, "Укажите тему встречи"),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
