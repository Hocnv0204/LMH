import { useQuery } from '@tanstack/react-query'
import { leaderboardApi, LeaderboardParams } from '@/api/leaderboard'

export const useLeaderboard = (params: LeaderboardParams = {}) => {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: () => leaderboardApi.getLeaderboard(params),
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
  })
}
