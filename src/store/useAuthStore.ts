import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isInitializing: boolean;
  setUser: (user: User | null, isAdmin?: boolean) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isInitializing: true,
  setUser: (user, isAdmin = false) => set({ user, isAdmin, isInitializing: false }),
  setInitialized: () => set({ isInitializing: false }),
}));
