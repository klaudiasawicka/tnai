import { apiClient } from './axiosInstance'
import type { TokenDto, UserDto, LoginRequest, RegisterRequest } from '@/auth/authType'
import { RoleName } from '@/auth/authType'

// .NET JwtSecurityTokenHandler serializes ClaimTypes to these JWT keys
const CLAIM_NAME_ID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

function pick(payload: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (payload[key]) return payload[key]
  }
  return ''
}

export function decodeUserFromToken(accessToken: string): UserDto {
  const part = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const payload = JSON.parse(atob(part)) as Record<string, string>

  const id = pick(payload, CLAIM_NAME_ID, 'nameid', 'sub')
  const email = pick(payload, CLAIM_EMAIL, 'email')
  const roleStr = pick(payload, CLAIM_ROLE, 'role')

  const roleName =
    roleStr === 'Admin'
      ? RoleName.Admin
      : roleStr === 'Manager'
        ? RoleName.Manager
        : RoleName.User

  const initials = email.slice(0, 1).toUpperCase()

  return {
    id,
    email,
    nameSurname: '',
    initials,
    createdAt: new Date().toISOString(),
    roleId: '',
    roleName,
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenDto> => {
    const res = await apiClient.post<TokenDto>('/api/auth/login', data)
    return res.data
  },

  register: async (data: RegisterRequest): Promise<UserDto> => {
    const res = await apiClient.post<UserDto>('/api/auth/register', data)
    return res.data
  },

  refresh: async (tokens: TokenDto): Promise<TokenDto> => {
    const res = await apiClient.post<TokenDto>('/api/auth/refresh', tokens)
    return res.data
  },
}
