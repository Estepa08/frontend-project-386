import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export function AuthGuard() {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
