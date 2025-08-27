import { CustomResponse, PageResponse } from '@/types/common.ts'
import type {
  AdminHistoryResponse,
  TopLessonStatsResponse,
  TopUserStatsResponse,
} from '@/types/history'
import { fetchApi } from '@/api/api.ts'

export const historyApi = {
  // History list endpoints
  getHistoryForToday: async (
    page: number,
    size: number
  ): Promise<CustomResponse<PageResponse<AdminHistoryResponse>>> => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('size', size.toString())
    params.append('sort', 'createdAt,DESC')

    return fetchApi(`/admin/histories/today?${params.toString()}`)
  },

  getHistoryForThisWeek: async (
    page: number,
    size: number
  ): Promise<CustomResponse<PageResponse<AdminHistoryResponse>>> => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('size', size.toString())
    params.append('sort', 'createdAt,DESC')

    return fetchApi(`/admin/histories/this-week?${params.toString()}`)
  },

  getHistoryForThisMonth: async (
    page: number,
    size: number
  ): Promise<CustomResponse<PageResponse<AdminHistoryResponse>>> => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('size', size.toString())
    params.append('sort', 'createdAt,DESC')

    return fetchApi(`/admin/histories/this-month?${params.toString()}`)
  },

  // Statistics endpoints
  getTopLessonsToday: async (): Promise<
    CustomResponse<TopLessonStatsResponse[]>
  > => {
    return fetchApi('/admin/histories/stats/lessons/top-today')
  },

  getTopLessonsThisWeek: async (): Promise<
    CustomResponse<TopLessonStatsResponse[]>
  > => {
    return fetchApi('/admin/histories/stats/lessons/top-this-week')
  },

  getTopUsersToday: async (): Promise<
    CustomResponse<TopUserStatsResponse[]>
  > => {
    return fetchApi('/admin/histories/stats/users/top-today')
  },

  getTopUsersThisWeek: async (): Promise<
    CustomResponse<TopUserStatsResponse[]>
  > => {
    return fetchApi('/admin/histories/stats/users/top-this-week')
  },

  // Helper function to get history based on time period
  getHistoryByPeriod: async (
    timePeriod: string,
    page: number,
    size: number
  ): Promise<CustomResponse<PageResponse<AdminHistoryResponse>>> => {
    switch (timePeriod) {
      case 'today':
        return historyApi.getHistoryForToday(page, size)
      case 'this-week':
        return historyApi.getHistoryForThisWeek(page, size)
      case 'this-month':
        return historyApi.getHistoryForThisMonth(page, size)
      default:
        return historyApi.getHistoryForToday(page, size)
    }
  },
}
