import { useMutation } from '@tanstack/react-query'
import { authApi, decodeUserFromToken } from '@/api/authApi'
import { useAuthStore } from '@/store/authStore'
import type { LoginRequest, RegisterRequest } from '@/auth/authType'

export function useLogin() {
  const { setTokens, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const tokens = await authApi.login(credentials)
      setTokens(tokens)
      // Decode JWT claims to build a partial UserDto (backend has no /me endpoint)
      const user = decodeUserFromToken(tokens.accessToken)
      setUser(user)
      return tokens
    },
  })
}

export function useRegister() {
  const { setTokens, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const userDto = await authApi.register(data)
      const tokens = await authApi.login({ email: data.email, password: data.password })
      setTokens(tokens)
      // Merge register response (nameSurname, createdAt) with decoded JWT (id, email, roleName)
      const decoded = decodeUserFromToken(tokens.accessToken)
      setUser({
        ...decoded,
        nameSurname: userDto.nameSurname,
        initials: userDto.nameSurname?.charAt(0)?.toUpperCase() ?? decoded.initials,
        roleId: userDto.roleId || decoded.roleId,
        createdAt: userDto.createdAt || decoded.createdAt,
      })
      return userDto
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  return () => logout()
}

export function useRefreshToken() {
  const { token, refreshToken, setTokens, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      if (!token || !refreshToken) throw new Error('No tokens to refresh')
      const tokens = await authApi.refresh({ accessToken: token, refreshToken })
      setTokens(tokens)
      const user = decodeUserFromToken(tokens.accessToken)
      setUser(user)
      return tokens
    },
  })
}
