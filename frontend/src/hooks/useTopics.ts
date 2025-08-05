import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateTopic() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      // API call implementation
      const response = await fetch('/api/topics', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
    }
  })
}

export function useUpdateTopic() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // API call implementation
      const response = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
    }
  })
}
