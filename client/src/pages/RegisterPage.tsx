import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/store/auth";
import { useCreateAdmin, useCreateUser } from "@/hooks/account";
import { login as apiLogin } from "@/api/auth";
import { registerSchema, type RegisterForm } from "@/lib/schemas";
import { AuthLayout } from "@/components/layout";
import { Button, Input, Label } from "@/components/ui";
import { ROLES, type Role } from "@/lib/constants";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const createAdminMutation = useCreateAdmin();
  const createUserMutation = useCreateUser();

  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);

    try {
      if (role === ROLES.ADMIN) {
        await createAdminMutation.mutateAsync(data);
      } else {
        await createUserMutation.mutateAsync(data);
      }

      const result = await apiLogin({ email: data.email, password: data.password });
      setSession(result.role, result.user);
      navigate(result.role === ROLES.ADMIN ? "/admin" : "/user/meets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    }
  };

  return (
    <AuthLayout
      subtitle="Создайте аккаунт"
      error={error}
      bottomLink={
        <>
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-medium text-zinc-900 hover:underline">
            Войти
          </Link>
        </>
      }
    >
      <div
        className="mb-6 flex rounded-lg border border-zinc-200 p-1"
        data-container="toggle--role"
      >
        <button
          type="button"
          onClick={() => setRole(ROLES.ADMIN)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            role === ROLES.ADMIN
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Администратор
        </button>
        <button
          type="button"
          onClick={() => setRole(ROLES.USER)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            role === ROLES.USER
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Клиент
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="mb-1 block" htmlFor="name">Имя</Label>
          <Input id="name" type="text" placeholder="Иван Иванов" {...register("name")} />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label className="mb-1 block" htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@example.com" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Label className="mb-1 block" htmlFor="password">Пароль</Label>
          <Input id="password" type="password" placeholder="********" {...register("password")} />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
    </AuthLayout>
  );
}
