import { create } from "zustand";

type Role = "admin" | "user" | null;

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  role: Role;
  user: User | null;
  login: (role: "admin" | "user") => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  role: null,
  user: null,
  login: (role) =>
    set({
      role,
      user: { id: role === "admin" ? "1" : "2", name: role === "admin" ? "Admin" : "User", email: `${role}@meetly.app` },
    }),
  logout: () => set({ role: null, user: null }),
}));
