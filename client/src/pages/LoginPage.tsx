import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { login as apiLogin } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Label } from "@/components/ui/label";

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
      setSession(result.role, result.user, result.token);
      navigate(result.role === "admin" ? "/admin" : "/user/meets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setPending(false);
    }
  };

  const handleMockLogin = (role: "admin" | "user") => {
    mockLogin(role);
    navigate(role === "admin" ? "/admin" : "/user/meets");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50" data-container="page--login">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm" data-container="card--login">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">Meetly</h1>
        <p className="mb-6 text-sm text-zinc-500">Войдите в систему</p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="mb-6 space-y-4">
          <div>
            <Label className="mb-1 block">Email</Label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label className="mb-1 block">Пароль</Label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
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

        <p className="mb-3 text-center text-xs text-zinc-500">
          Быстрый вход (без API)
        </p>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={() => handleMockLogin("admin")}
            className="w-full"
          >
            Войти как Admin
          </Button>
          <Button
            type="button"
            onClick={() => handleMockLogin("user")}
            variant="outline"
            className="w-full"
          >
            Войти как User
          </Button>
        </div>
      </div>
    </div>
  );
}
