import { create } from 'zustand'

const initialState = {
  user: null,
  profile: null,
}

export const useAuthStore = create((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  // Keep one clear path to avoid partial auth state
  clearUser: () => set(initialState),
  clearAuth: () => set(initialState),
}))
