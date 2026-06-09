import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserDto, TokenDto } from '@/auth/authType'
import { queryClient } from '@/lib/queryClient'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: UserDto | null
  isAuthenticated: boolean
}

interface AuthActions {
  setTokens: (tokens: TokenDto) => void
  setUser: (user: UserDto) => void
  logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (tokens) =>
        set({
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      logout: () => {
        queryClient.clear()
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
      },
    }),
    { name: 'deskflow-auth' }
  )
)
