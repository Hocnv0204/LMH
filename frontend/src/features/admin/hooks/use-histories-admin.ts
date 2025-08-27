import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { HistoryFilters } from '@/types/history'
import { historyApi } from '@/features/admin/api/adminHistoryApi'

export const useHistory = (filters: HistoryFilters) => {
  return useQuery({
    queryKey: ['history', filters.timePeriod, filters.page, filters.size],
    queryFn: () =>
      historyApi.getHistoryByPeriod(
        filters.timePeriod,
        filters.page,
        filters.size
      ),
    placeholderData: keepPreviousData,
  })
}

export const useTopLessonsToday = () => {
  return useQuery({
    queryKey: ['top-lessons-today'],
    queryFn: () => historyApi.getTopLessonsToday(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTopLessonsThisWeek = () => {
  return useQuery({
    queryKey: ['top-lessons-this-week'],
    queryFn: () => historyApi.getTopLessonsThisWeek(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTopUsersToday = () => {
  return useQuery({
    queryKey: ['top-users-today'],
    queryFn: () => historyApi.getTopUsersToday(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTopUsersThisWeek = () => {
  return useQuery({
    queryKey: ['top-users-this-week'],
    queryFn: () => historyApi.getTopUsersThisWeek(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
