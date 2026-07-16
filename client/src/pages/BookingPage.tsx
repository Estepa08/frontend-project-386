import { BookingWizard } from "@/components/booking/BookingWizard";
import { useAuth } from "@/store/auth";

export function BookingPage() {
  const { role } = useAuth();

  if (role !== "user") {
    return (
      <p className="py-10 text-center text-sm text-zinc-400">
        Эта страница для пользователей. Войдите как User.
      </p>
    );
  }

  return <BookingWizard />;
}
