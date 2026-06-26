import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  clearAuth: () => set({ user: null, profile: null }),
}))
