import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-zinc-900">
            Meetly
          </Link>

          {role === "admin" && (
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/admin" className="text-zinc-600 hover:text-zinc-900">
                Обзор
              </Link>
              <Link to="/admin/meeting-types" className="text-zinc-600 hover:text-zinc-900">
                Типы встреч
              </Link>
              <Link to="/admin/availability" className="text-zinc-600 hover:text-zinc-900">
                График
              </Link>
              <Link to="/admin/meets" className="text-zinc-600 hover:text-zinc-900">
                Встречи
              </Link>
            </nav>
          )}

          {role === "user" && (
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/booking" className="text-zinc-600 hover:text-zinc-900">
                Забронировать
              </Link>
              <Link to="/user/meets" className="text-zinc-600 hover:text-zinc-900">
                Мои встречи
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-zinc-500">{user.name}</span>
          )}
          {role && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Выйти
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
