import { create } from "zustand";

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface MeetingType {
  id: number;
  duration: 15 | 30;
  category: string;
}

interface Slot {
  startTime: string;
  endTime: string;
}

interface BookingState {
  step: 1 | 2 | 3 | 4;
  admin: Admin | null;
  meetingType: MeetingType | null;
  date: Date | null;
  slot: Slot | null;
  theme: string;
  comment: string;
  guests: string[];
  confirmedMeet: { inviteLink: string; startTime: string; theme: string; adminName: string } | null;

  setStep: (step: 1 | 2 | 3 | 4) => void;
  setAdmin: (admin: Admin) => void;
  setMeetingType: (mt: MeetingType) => void;
  setDate: (date: Date | null) => void;
  setSlot: (slot: Slot | null) => void;
  setTheme: (theme: string) => void;
  setComment: (comment: string) => void;
  addGuest: () => void;
  removeGuest: (index: number) => void;
  updateGuest: (index: number, value: string) => void;
  setConfirmedMeet: (meet: { inviteLink: string; startTime: string; theme: string; adminName: string }) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as const,
  admin: null,
  meetingType: null,
  date: null,
  slot: null,
  theme: "",
  comment: "",
  guests: [""],
  confirmedMeet: null,
};

export const useBooking = create<BookingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setAdmin: (admin) => set({ admin, step: 2 }),
  setMeetingType: (meetingType) => set({ meetingType, date: null, slot: null }),
  setDate: (date) => set({ date, slot: null }),
  setSlot: (slot) => set({ slot }),
  setTheme: (theme) => set({ theme }),
  setComment: (comment) => set({ comment }),
  addGuest: () => set((s) => ({ guests: [...s.guests, ""] })),
  removeGuest: (index) => set((state) => ({ guests: state.guests.filter((_, idx) => idx !== index) })),
  updateGuest: (index, value) =>
    set((state) => {
      const updated = [...state.guests];
      updated[index] = value;
      return { guests: updated };
    }),
  setConfirmedMeet: (confirmedMeet) => set({ confirmedMeet, step: 4 }),
  reset: () => set({ ...initialState }),
}));
