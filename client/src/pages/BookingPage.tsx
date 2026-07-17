import { Navigate } from "react-router-dom";
import { BookingWizard } from "@/components/booking";
import { useAuth } from "@/store/auth";
import { ROLES } from "@/lib/constants";

export function BookingPage() {
  const { role } = useAuth();

  if (role !== ROLES.USER) {
    return <Navigate to="/login" replace />;
  }

  return <BookingWizard />;
}
