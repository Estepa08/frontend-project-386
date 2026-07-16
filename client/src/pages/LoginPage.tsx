import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: "admin" | "user") => {
    login(role);
    navigate(role === "admin" ? "/admin" : "/user");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">Meetly</h1>
        <p className="mb-6 text-sm text-zinc-500">Выберите роль для входа</p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => handleLogin("admin")} className="w-full">
            Войти как Admin
          </Button>
          <Button onClick={() => handleLogin("user")} variant="outline" className="w-full">
            Войти как User
          </Button>
        </div>
      </div>
    </div>
  );
}
