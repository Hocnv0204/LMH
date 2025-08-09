export interface AdminUserSummaryResponse {
  id: number
  username: string
  email: string
  credit: number
  createdAt: string
  deleteFlag: boolean
  topicCount: number
  lessonCount: number
}

export interface AdminUserDetailResponse {
  id: number
  name: string
  username: string
  email: string
  phoneNumber?: string
  dateOfBirth?: string
  school?: string
  role: string
  point: number
  credit: number
  createdAt: string
  lastLogin?: string
  deleteFlag: boolean
  topicCount: number
  lessonCount: number
}

export interface AdminUpdateUserRequest {
  role?: string
  credit?: number
}

export interface UserFilters {
  searchTerm?: string
  role?: string
  isDeleted?: boolean
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}

export const USER_ROLES = ['USER', 'ADMIN'] as const

export type UserRole = (typeof USER_ROLES)[number]
