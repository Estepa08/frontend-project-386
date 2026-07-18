import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { login as apiLogin } from "@/api/auth";
import { AuthLayout } from "@/components/layout";
import { Button, Input, Label } from "@/components/ui";
import { ROLES, type Role } from "@/lib/constants";

export function LoginPage() {
  const { login: mockLogin, setSession } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const result = await apiLogin({ email, password });
      setSession(result.role, result.user);
      navigate(result.role === ROLES.ADMIN ? "/admin" : "/user/meets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setPending(false);
    }
  };

  const handleMockLogin = (role: Role) => {
    mockLogin(role);
    navigate(role === ROLES.ADMIN ? "/admin" : "/user/meets");
  };

  return (
    <AuthLayout
      subtitle="Войдите в систему"
      error={error}
      bottomLink={
        <>
          Нет аккаунта?{" "}
          <Link to="/register" className="font-medium text-zinc-900 hover:underline">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleFormSubmit} className="mb-6 space-y-4">
        <div>
          <Label className="mb-1 block">Email</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label className="mb-1 block">Пароль</Label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Вход..." : "Войти"}
        </Button>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs text-zinc-400">
          <span className="bg-white px-2">или</span>
        </div>
      </div>

      {import.meta.env.VITE_USE_MOCK === "true" && (
        <>
          <p className="mb-3 text-center text-xs text-zinc-500">
            Быстрый вход (без API)
          </p>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => handleMockLogin(ROLES.ADMIN)}
              className="w-full"
            >
              Войти как Admin
            </Button>
            <Button
              type="button"
              onClick={() => handleMockLogin(ROLES.USER)}
              variant="outline"
              className="w-full"
            >
              Войти как User
            </Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
