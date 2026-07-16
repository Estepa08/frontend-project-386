import { create } from "zustand";
import { setToken, clearToken } from "@/api/client";

type Role = "admin" | "user" | null;

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  role: Role;
  user: User | null;
  login: (role: "admin" | "user") => void;
  setSession: (role: Role, user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  role: null,
  user: null,
  login: (role) =>
    set({
      role,
      user: {
        id: role === "admin" ? "1" : "2",
        name: role === "admin" ? "Admin" : "User",
        email: `${role}@meetly.app`,
        createdAt: new Date().toISOString(),
      },
    }),
  setSession: (role, user, token) => {
    setToken(token);
    set({ role, user });
  },
  logout: () => {
    clearToken();
    set({ role: null, user: null });
  },
}));
