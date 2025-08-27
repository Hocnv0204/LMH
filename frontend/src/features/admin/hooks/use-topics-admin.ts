import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import type {
  TopicFilters,
  AdminCreateTopicRequest,
  AdminUpdateTopicRequest,
} from '@/types/topic.ts'
import { toast } from 'sonner'
import { topicApi } from '@/features/admin/api/adminTopicApi'

export const useTopicsAdmin = (filters: TopicFilters) => {
  return useQuery({
    queryKey: ['topics', filters],
    queryFn: () => topicApi.getAllTopics(filters),
    placeholderData: keepPreviousData,
  })
}

export const useTopicDetails = (topicId: number) => {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: () => topicApi.getTopicDetails(topicId),
    enabled: !!topicId,
  })
}

export const useCreateTopic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      request,
      file,
    }: {
      request: AdminCreateTopicRequest
      file?: File
    }) => topicApi.createTopic(request, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast.success('Success', {
        description: 'Topic created successfully',
      })
    },
    onError: (error) => {
      toast.error('Error', {
        description: 'Failed to create topic',
      })
    },
  })
}

export const useUpdateTopic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      topicId,
      request,
      file,
    }: {
      topicId: number
      request: AdminUpdateTopicRequest
      file?: File
    }) => topicApi.updateTopic(topicId, request, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      queryClient.invalidateQueries({ queryKey: ['topic', variables.topicId] })
      toast.success('Success', {
        description: 'Topic updated successfully',
      })
    },
    onError: (error) => {
      toast.error('Error', {
        description: 'Failed to update topic',
      })
    },
  })
}

export const useDeleteTopic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (topicId: number) => topicApi.deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast.success('Success', {
        description: 'Topic deleted successfully',
      })
    },
    onError: (error) => {
      toast.error('Error', {
        description: 'Failed to delete topic',
      })
    },
  })
}

export const useRestoreTopic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // Viết tường minh để rõ ràng hơn
    mutationFn: (topicId: number) => topicApi.restoreTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast.success('Success', {
        description: 'Topic restored successfully',
      })
    },
    onError: (error) => {
      toast.error('Error', {
        description: 'Failed to restore topic',
      })
    },
  })
}
