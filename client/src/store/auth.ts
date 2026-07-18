import { create } from "zustand";
import type { components } from "@/api/generated/schema";
import { ROLES, type Role } from "@/lib/constants";

type AuthRole = Role | null;
type User = components["schemas"]["Admin"] | components["schemas"]["User"];

interface AuthState {
  role: AuthRole;
  user: User | null;
  login: (role: Role) => void;
  setSession: (role: AuthRole, user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  role: null,
  user: null,
  login: (role) =>
    set({
      role,
      user: {
        id: role === ROLES.ADMIN ? "1" : "2",
        name: role === ROLES.ADMIN ? "Admin" : "User",
        email: `${role}@meetly.app`,
        createdAt: new Date().toISOString(),
      },
    }),
  setSession: (role, user) => {
    set({ role, user });
  },
  logout: () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    set({ role: null, user: null });
  },
}));
