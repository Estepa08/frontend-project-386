import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "@/store/role";

export function RoleGuard() {
  const role = useRole((state) => state.role);

  if (role !== "owner") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
