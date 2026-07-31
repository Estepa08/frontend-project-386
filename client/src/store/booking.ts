import { create } from "zustand";
import type { components } from "@/api/generated/schema";

type Slot = components["schemas"]["Slot"];
type EventType = components["schemas"]["EventType"];

interface BookingState {
  eventType: EventType | null;
  step: 1 | 2 | 3;
  date: Date | null;
  slot: Slot | null;
  name: string;
  email: string;
  theme: string;
  confirmedMeet: { inviteLink: string; startTime: string; theme: string } | null;

  setEventType: (eventType: EventType) => void;
  setStep: (step: 1 | 2 | 3) => void;
  setDate: (date: Date | null) => void;
  setSlot: (slot: Slot | null) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setTheme: (theme: string) => void;
  setConfirmedMeet: (meet: { inviteLink: string; startTime: string; theme: string }) => void;
  reset: () => void;
}

const initialState = {
  eventType: null,
  step: 1 as const,
  date: null,
  slot: null,
  name: "",
  email: "",
  theme: "",
  confirmedMeet: null,
};

export const useBooking = create<BookingState>((set) => ({
  ...initialState,

  setEventType: (eventType) =>
    set({ eventType, step: 1, date: null, slot: null }),
  setStep: (step) => set({ step }),
  setDate: (date) => set({ date, slot: null }),
  setSlot: (slot) => set({ slot }),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setTheme: (theme) => set({ theme }),
  setConfirmedMeet: (confirmedMeet) => set({ confirmedMeet, step: 3 }),
  reset: () => set({ ...initialState }),
}));
