import { create } from "zustand";
import type { components } from "@/api/generated/schema";
import type { SlotDuration } from "@/lib/constants";

type Slot = components["schemas"]["Slot"];

interface BookingState {
  step: 1 | 2 | 3;
  date: Date | null;
  slot: Slot | null;
  duration: SlotDuration | null;
  name: string;
  email: string;
  theme: string;
  confirmedMeet: { inviteLink: string; startTime: string; theme: string } | null;

  setStep: (step: 1 | 2 | 3) => void;
  setDate: (date: Date | null) => void;
  setSlot: (slot: Slot | null) => void;
  setDuration: (duration: SlotDuration) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setTheme: (theme: string) => void;
  setConfirmedMeet: (meet: { inviteLink: string; startTime: string; theme: string }) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as const,
  date: null,
  slot: null,
  duration: null as SlotDuration | null,
  name: "",
  email: "",
  theme: "",
  confirmedMeet: null,
};

export const useBooking = create<BookingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setDate: (date) => set({ date, slot: null }),
  setSlot: (slot) => set({ slot }),
  setDuration: (duration) => set({ duration, date: null, slot: null }),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setTheme: (theme) => set({ theme }),
  setConfirmedMeet: (confirmedMeet) => set({ confirmedMeet, step: 3 }),
  reset: () => set({ ...initialState }),
}));
