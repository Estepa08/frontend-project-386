import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function NavItem({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "relative text-sm transition-colors duration-200",
          "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-zinc-900 after:transition-all after:duration-300",
          isActive
            ? "text-zinc-900 after:w-full"
            : "text-zinc-600 hover:text-zinc-900 after:w-0 hover:after:w-full",
        )
      }
    >
      {children}
    </NavLink>
  );
}

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
          <NavLink to="/" end className="text-lg font-bold tracking-tight text-zinc-900">
            Meetly
          </NavLink>

          {role === "admin" && (
            <nav className="flex items-center gap-4 text-sm">
              <NavItem to="/admin" end>Обзор</NavItem>
              <NavItem to="/admin/meeting-types">Типы встреч</NavItem>
              <NavItem to="/admin/availability">График</NavItem>
              <NavItem to="/admin/meets">Встречи</NavItem>
            </nav>
          )}

          {role === "user" && (
            <nav className="flex items-center gap-4 text-sm">
              <NavItem to="/booking">Забронировать</NavItem>
              <NavItem to="/user/meets">Мои встречи</NavItem>
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
