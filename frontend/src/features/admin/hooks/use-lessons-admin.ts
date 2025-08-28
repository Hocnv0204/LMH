import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import type {
  LessonFilters,
  AdminCreateLessonRequest,
  AdminUpdateLessonRequest,
  AdminUpdateSuggestVocabularyRequest,
} from '@/types/lesson'
import { toast } from 'sonner'
// <-- Import toast từ sonner
import { lessonApi } from '@/features/admin/api/adminLessonApi'

const { VITE_API_BASE_URL } = import.meta.env

export const useLessons = (filters: LessonFilters) => {
  return useQuery({
    queryKey: ['lessons', filters],
    queryFn: () => lessonApi.getAllLessons(filters),
    placeholderData: keepPreviousData,
  })
}

export const useLessonDetails = (lessonId: number) => {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonApi.getLessonDetails(lessonId),
    enabled: !!lessonId,
  })
}

export const useAvailableLanguages = () => {
  return useQuery({
    queryKey: ['available-languages'],
    queryFn: () => lessonApi.getAvailableLanguages(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTopicsByLanguage = (languageId: number) => {
  return useQuery({
    queryKey: ['topics-by-language', languageId],
    queryFn: () => lessonApi.getTopicsByLanguage(languageId),
    enabled: !!languageId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useLevelsByLanguage = (languageId: number) => {
  return useQuery({
    queryKey: ['levels-by-language', languageId],
    queryFn: () => lessonApi.getLevelsByLanguage(languageId),
    enabled: !!languageId,
    staleTime: 5 * 60 * 1000,
  })
}

// export const useGenerateLessonWithAI = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (request: AdminCreateLessonRequest) =>
//       lessonApi.generateLessonWithAI(request),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['lessons'] })
//       // Sửa ở đây
//       toast.success('Success', {
//         description: 'Lesson generation request submitted successfully',
//       })
//     },
//     onError: (error) => {
//       // Sửa ở đây
//       toast.error('Error', {
//         description: 'Failed to submit lesson generation request',
//       })
//     },
//   })
// }

/**
 * Hook để tạo bài học với AI, bao gồm cả việc lắng nghe SSE
 */
export const useGenerateLessonWithAI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: AdminCreateLessonRequest) =>
      lessonApi.generateLessonWithAI(request),
    // onSuccess chỉ xử lý khi YÊU CẦU BAN ĐẦU được chấp nhận
    onSuccess: () => {
      toast.info('Request Accepted', {
        description:
          'AI is generating the lesson. You will be notified upon completion.',
      })

      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast.error('Authentication Error', {
          description: 'Could not find auth token for notifications.',
        })
        return
      }

      // Mở kết nối SSE
      const eventSource = new EventSource(
        `${VITE_API_BASE_URL}/sse/subscribe?token=${token}`
      )

      eventSource.onopen = () => {
        console.log('SSE connection established for lesson generation.')
      }

      // Lắng nghe sự kiện thành công
      eventSource.addEventListener('lesson_generation_success', (event) => {
        const data = JSON.parse(event.data)
        toast.success('Lesson Generation Successful', {
          description: `Lesson "${data.title}" has been created.`,
        })
        // Làm mới lại danh sách bài học
        queryClient.invalidateQueries({ queryKey: ['lessons'] })
        // Đóng kết nối
        eventSource.close()
      })

      // Lắng nghe sự kiện thất bại
      eventSource.addEventListener('lesson_generation_failed', (event) => {
        const data = JSON.parse(event.data)
        toast.error('Lesson Generation Failed', {
          description: data.message || 'An unknown error occurred with the AI.',
          duration: 10000, // Hiển thị lỗi lâu hơn
        })
        // Đóng kết nối
        eventSource.close()
      })

      // Xử lý lỗi kết nối SSE
      eventSource.onerror = (error) => {
        console.error('SSE Error:', error)
        toast.error('Notification Error', {
          description: 'Lost connection to the notification service.',
        })
        eventSource.close()
      }
    },
    // onError chỉ xử lý khi YÊU CẦU BAN ĐẦU thất bại (vd: server down)
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to submit lesson generation request'
      toast.error('Submission Error', {
        description: errorMessage,
      })
    },
  })
}

export const useUpdateLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      lessonId,
      request,
    }: {
      lessonId: number
      request: AdminUpdateLessonRequest
    }) => lessonApi.updateLesson(lessonId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['lesson'] })
      // Sửa ở đây
      toast.success('Success', {
        description: 'Lesson updated successfully',
      })
    },
    onError: (error) => {
      // Sửa ở đây
      toast.error('Error', {
        description: 'Failed to update lesson',
      })
    },
  })
}

export const useUpdateLessonVocabularies = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      lessonId,
      vocabularies,
    }: {
      lessonId: number
      vocabularies: AdminUpdateSuggestVocabularyRequest[]
    }) => lessonApi.updateLessonVocabularies(lessonId, vocabularies),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson'] })
      // Sửa ở đây
      toast.success('Success', {
        description: 'Lesson vocabularies updated successfully',
      })
    },
    onError: (error) => {
      // Sửa ở đây
      toast.error('Error', {
        description: 'Failed to update lesson vocabularies',
      })
    },
  })
}

export const useDeleteLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: lessonApi.deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      // Sửa ở đây
      toast.success('Success', {
        description: 'Lesson deleted successfully',
      })
    },
    onError: (error) => {
      // Sửa ở đây
      toast.error('Error', {
        description: 'Failed to delete lesson',
      })
    },
  })
}

export const useRestoreLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: lessonApi.restoreLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      // Sửa ở đây
      toast.success('Success', {
        description: 'Lesson restored successfully',
      })
    },
    onError: (error) => {
      // Sửa ở đây
      toast.error('Error', {
        description: 'Failed to restore lesson',
      })
    },
  })
}
