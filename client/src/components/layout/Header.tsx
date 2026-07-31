import { useState, useCallback, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut } from "lucide-react";
import { getNavByRole } from "@/lib/constants";
import { useRole, type Role } from "@/store/role";

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

const ROLE_LABELS: Record<Role, string> = {
  owner: "Владелец",
  user: "Пользователь",
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useRole((state) => state.role);
  const clearRole = useRole((state) => state.clearRole);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const nav = getNavByRole(role);

  const handleSwitchRole = () => {
    clearRole();
    navigate("/");
  };

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

        {nav.length > 0 && (
          <nav className="hidden md:flex items-center gap-4 text-sm">
            {nav.map((item) => (
              <NavItem key={item.to} to={item.to} end={item.end}>{item.label}</NavItem>
            ))}
          </nav>
        )}

        {role && (
          <button
            onClick={handleSwitchRole}
            className="hidden md:inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
            data-container="header--switch-role"
          >
            <LogOut className="h-4 w-4" />
            {ROLE_LABELS[role]} · Сменить
          </button>
        )}
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute left-0 right-0 top-14 z-50 border-b border-zinc-200 bg-white px-4 py-4 shadow-lg" data-container="header--mobile-menu">
          <nav className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <NavItem key={item.to} to={item.to} end={item.end} onClick={closeMobile}>{item.label}</NavItem>
            ))}
          </nav>

          {role && (
            <button
              onClick={handleSwitchRole}
              className="mt-4 inline-flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600"
            >
              <LogOut className="h-4 w-4" />
              {ROLE_LABELS[role]} · Сменить роль
            </button>
          )}
        </div>
      )}
    </header>
  );
}
