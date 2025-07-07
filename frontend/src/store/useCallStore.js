// for preventing duplicate entry
import { create } from "zustand";

export const useCallStore = create((set) => ({
  callId: null,
  isActive: false,
  join: (id) => set({ callId: id, isActive: true }),
  end: () => set({ callId: null, isActive: false }),
}));
