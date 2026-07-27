import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { AuthLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { ROLES, type Role } from "@/lib/constants";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    navigate(role === ROLES.ADMIN ? "/admin" : "/user/meets");
  };

  return (
    <AuthLayout subtitle="Войдите в систему">
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={() => handleLogin(ROLES.ADMIN)}
          className="w-full"
        >
          Войти как Администратор
        </Button>
        <Button
          type="button"
          onClick={() => handleLogin(ROLES.USER)}
          variant="outline"
          className="w-full"
        >
          Войти как Клиент
        </Button>
      </div>
    </AuthLayout>
  );
}
