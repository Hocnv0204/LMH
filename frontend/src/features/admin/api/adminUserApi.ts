import { CustomResponse, PageResponse } from '@/types/common.ts'
import type {
  AdminUserSummaryResponse,
  AdminUserDetailResponse,
  AdminUpdateUserRequest,
  UserFilters,
} from '@/types/user.ts'
import { fetchApi } from '@/api/api.ts'

export const userApi = {
  getAllUsers: async (
    filters: UserFilters
  ): Promise<CustomResponse<PageResponse<AdminUserSummaryResponse>>> => {
    const params = new URLSearchParams()

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.role) params.append('role', filters.role)
    if (filters.isDeleted !== undefined)
      params.append('isDeleted', filters.isDeleted.toString())
    params.append('page', filters.page.toString())
    params.append('size', filters.size.toString())
    params.append('sortBy', filters.sortBy)
    params.append('sortDir', filters.sortDir)

    return fetchApi(`/admin/users?${params.toString()}`)
  },

  getUserDetails: async (
    userId: number
  ): Promise<CustomResponse<AdminUserDetailResponse>> => {
    return fetchApi(`/admin/users/${userId}`)
  },

  updateUser: async (
    userId: number,
    request: AdminUpdateUserRequest
  ): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  },

  deleteUser: async (userId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  },

  restoreUser: async (userId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/users/${userId}/restore`, {
      method: 'PUT',
    })
  },
}
