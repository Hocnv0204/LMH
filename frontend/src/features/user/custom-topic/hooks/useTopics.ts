import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { topicApi } from '@/features/user/custom-topic/api/topicApi'
import type {
  TopicRequest,
  TopicFilters,
} from '@/features/user/custom-topic/types/topic'

export const useMyTopics = (filters: TopicFilters) => {
  return useQuery({
    queryKey: ['my-topics', filters],
    queryFn: () => topicApi.getMyTopics(filters),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCreateTopic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ request, file }: { request: TopicRequest; file?: File }) =>
      topicApi.createTopic(request, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-topics'] })
      toast.success('Topic created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create topic')
      console.error('Create topic error:', error)
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
      request: TopicRequest
      file?: File
    }) => topicApi.updateTopic(topicId, request, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-topics'] })
      toast.success('Topic updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update topic')
      console.error('Update topic error:', error)
    },
  })
}

export const useDeleteTopic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (topicId: number) => topicApi.deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-topics'] })
      toast.success('Topic deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete topic')
      console.error('Delete topic error:', error)
    },
  })
}
