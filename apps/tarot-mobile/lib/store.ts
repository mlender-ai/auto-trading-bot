import { create } from "zustand";

interface UserState {
  userId: string | null;
  credits: number;
  isLoggedIn: boolean;
  setUser: (userId: string) => void;
  setCredits: (credits: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  credits: 0,
  isLoggedIn: false,
  setUser: (userId) => set({ userId, isLoggedIn: true }),
  setCredits: (credits) => set({ credits }),
  logout: () => set({ userId: null, credits: 0, isLoggedIn: false }),
}));

interface DrawState {
  isDrawing: boolean;
  lastDrawId: string | null;
  setDrawing: (v: boolean) => void;
  setLastDrawId: (id: string) => void;
}

export const useDrawStore = create<DrawState>((set) => ({
  isDrawing: false,
  lastDrawId: null,
  setDrawing: (isDrawing) => set({ isDrawing }),
  setLastDrawId: (lastDrawId) => set({ lastDrawId }),
}));
