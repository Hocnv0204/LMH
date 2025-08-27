import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { userProfileApi } from '@/features/user-profile/api/profileApi'
import type {
  UpdateProfileRequest,
  UpdateApiConfigRequest,
  UserHistoryFilters,
} from '@/features/user-profile/types/user-profile'

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['current-user-profile'],
    // Sửa ở đây: getCurrentUserProfile -> getUserProfile
    queryFn: () => userProfileApi.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // Sửa ở đây: updateCurrentUserProfile -> updateUserProfile
    mutationFn: (request: UpdateProfileRequest) =>
      userProfileApi.updateUserProfile(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update profile')
    },
  })
}

export const useUpdateUserApiConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // Sửa ở đây: updateCurrentUserApiConfig -> updateUserApiConfig
    mutationFn: (request: UpdateApiConfigRequest) =>
      userProfileApi.updateUserApiConfig(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] })
      toast.success('API configuration updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update API configuration')
    },
  })
}

export const useUserHistory = (filters: UserHistoryFilters) => {
  return useQuery({
    queryKey: ['user-history', filters.page, filters.size],
    // Sửa ở đây: getHistoryForCurrentUser -> getUserHistory
    queryFn: () => userProfileApi.getUserHistory(filters.page, filters.size),
    placeholderData: keepPreviousData,
  })
}
