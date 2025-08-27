import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import type {
  LevelFilters,
  AdminCreateLevelRequest,
  AdminUpdateLevelRequest,
} from '@/types/level.ts'
import { toast } from 'sonner'
import { levelApi } from '@/features/admin/api/adminLevelApi'

export const useLevelsAdmin = (filters: LevelFilters) => {
  return useQuery({
    queryKey: ['levels', filters],
    queryFn: () => levelApi.getAllLevels(filters),
    placeholderData: keepPreviousData,
  })
}

export const useLevelDetails = (levelId: number) => {
  return useQuery({
    queryKey: ['level', levelId],
    queryFn: () => levelApi.getLevelDetails(levelId),
    enabled: !!levelId,
  })
}

export const useCreateLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: AdminCreateLevelRequest) =>
      levelApi.createLevel(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] })
      // Sửa lại cú pháp sonner
      toast.success('Level created successfully')
    },
    onError: (error) => {
      // Sửa lại cú pháp sonner
      toast.error('Failed to create level')
    },
  })
}

export const useUpdateLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      levelId,
      request,
    }: {
      levelId: number
      request: AdminUpdateLevelRequest
    }) => levelApi.updateLevel(levelId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] })
      queryClient.invalidateQueries({ queryKey: ['level'] })
      // Sửa lại cú pháp sonner
      toast.success('Level updated successfully')
    },
    onError: (error) => {
      // Sửa lại cú pháp sonner
      toast.error('Failed to update level')
    },
  })
}

export const useDeleteLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: levelApi.deleteLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] })
      // Sửa lại cú pháp sonner
      toast.success('Level deleted successfully')
    },
    onError: (error) => {
      // Sửa lại cú pháp sonner
      toast.error('Failed to delete level')
    },
  })
}

export const useRestoreLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: levelApi.restoreLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] })
      // Sửa lại cú pháp sonner
      toast.success('Level restored successfully')
    },
    onError: (error) => {
      // Sửa lại cú pháp sonner
      toast.error('Failed to restore level')
    },
  })
}
