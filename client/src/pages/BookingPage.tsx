import { Navigate } from "react-router-dom";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { useAuth } from "@/store/auth";

export function BookingPage() {
  const { role } = useAuth();

  if (role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return <BookingWizard />;
}
