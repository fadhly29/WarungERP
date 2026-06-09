import { create } from "zustand";
import type { User } from "@/types/database";

interface AuthState {
  user: User | null;
  session: unknown | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: unknown | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ isLoading: loading }),
  signOut: () => set({ user: null, session: null }),
}));
