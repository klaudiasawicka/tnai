export const RoleName = {
  Admin: 0,
  Manager: 1,
  User: 2,
} as const
export type RoleName = (typeof RoleName)[keyof typeof RoleName]

export interface UserDto {
  id: string
  email: string
  nameSurname: string
  initials: string
  createdAt: string
  roleId: string
  roleName: RoleName
}

export interface CreateUserDto {
  email: string
  password: string
  nameSurname: string
  initials: string
  roleId: string
}

export interface RoleDto {
  id: string
  roleName: RoleName
}

export interface TokenDto {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nameSurname: string
}
