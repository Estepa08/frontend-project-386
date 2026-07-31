import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "user";

interface RoleState {
  role: Role | null;
  setRole: (role: Role) => void;
  clearRole: () => void;
}

export const useRole = create<RoleState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),
    }),
    { name: "meetly-role" },
  ),
);
