import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user:  null,
  token: localStorage.getItem('lg_token'),

  login: (user, token) => {
    localStorage.setItem('lg_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('lg_token')
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user }),
}))
