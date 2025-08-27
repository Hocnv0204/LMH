import { fetchApi } from './api'
import { ApiResponse } from './client'

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty?: boolean
  numberOfElements?: number
}

export interface LeaderboardUser {
  id: number
  name: string | null
  username: string | null
  email: string | null
  point: number | null
  credit: number | null
  createdAt: string | null
  role: string | null
}

export interface LeaderboardParams {
  page?: number
  size?: number
  sortBy?: string
  sort?: 'asc' | 'desc'
}

export const leaderboardApi = {
  getLeaderboard: async (
    params: LeaderboardParams = {}
  ): Promise<ApiResponse<PaginatedResponse<LeaderboardUser>>> => {
    const searchParams = new URLSearchParams()

    if (params.page !== undefined)
      searchParams.append('page', params.page.toString())
    if (params.size !== undefined)
      searchParams.append('size', params.size.toString())
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sort) searchParams.append('sort', params.sort)

    const queryString = searchParams.toString()
    const endpoint = `/user/leader_board${queryString ? `?${queryString}` : ''}`

    return fetchApi<ApiResponse<PaginatedResponse<LeaderboardUser>>>(endpoint)
  },
}
