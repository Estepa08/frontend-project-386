import { useState, useCallback, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

function NavItem({ to, end, children, onClick }: { to: string; end?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
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
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header className="relative border-b border-zinc-200 bg-white" data-container="header">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4" data-container="header--inner">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Меню"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <NavLink to="/" end className="text-lg font-bold tracking-tight text-zinc-900">
            Meetly
          </NavLink>
        </div>

        {role === "admin" && (
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavItem to="/admin" end>Обзор</NavItem>
            <NavItem to="/admin/meeting-types">Типы встреч</NavItem>
            <NavItem to="/admin/availability">График</NavItem>
            <NavItem to="/admin/meets">Встречи</NavItem>
          </nav>
        )}

        {role === "user" && (
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavItem to="/booking">Забронировать</NavItem>
            <NavItem to="/user/meets">Мои встречи</NavItem>
          </nav>
        )}

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

      {mobileOpen && (
        <div className="md:hidden absolute left-0 right-0 top-14 z-50 border-b border-zinc-200 bg-white px-4 py-4 shadow-lg" data-container="header--mobile-menu">
          {role === "admin" && (
            <nav className="flex flex-col gap-3 text-sm">
              <NavItem to="/admin" end onClick={closeMobile}>Обзор</NavItem>
              <NavItem to="/admin/meeting-types" onClick={closeMobile}>Типы встреч</NavItem>
              <NavItem to="/admin/availability" onClick={closeMobile}>График</NavItem>
              <NavItem to="/admin/meets" onClick={closeMobile}>Встречи</NavItem>
            </nav>
          )}

          {role === "user" && (
            <nav className="flex flex-col gap-3 text-sm">
              <NavItem to="/booking" onClick={closeMobile}>Забронировать</NavItem>
              <NavItem to="/user/meets" onClick={closeMobile}>Мои встречи</NavItem>
            </nav>
          )}
        </div>
      )}
    </header>
  );
}
