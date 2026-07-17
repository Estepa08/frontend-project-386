import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { createAdmin } from "@/api/admins";
import { createUser } from "@/api/users";
import { login as apiLogin } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";

type Role = "admin" | "user";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [role, setRole] = useState<Role>("admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (role === "admin") {
        await createAdmin({ name, email, password });
      } else {
        await createUser({ name, email, password });
      }

      const result = await apiLogin({ email, password });
      setSession(result.role, result.user, result.token);
      navigate(result.role === "admin" ? "/admin" : "/user/meets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">Meetly</h1>
        <p className="mb-6 text-sm text-zinc-500">Создайте аккаунт</p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="mb-6 flex rounded-lg border border-zinc-200 p-1">
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              role === "admin"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Администратор
          </button>
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              role === "user"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Клиент
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1 block">Имя</Label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-medium text-zinc-900 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
