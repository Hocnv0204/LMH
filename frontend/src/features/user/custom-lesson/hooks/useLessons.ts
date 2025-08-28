import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userLessonApi } from '@/features/user/custom-lesson/api/userLessonApi'
import type { LessonFilters, AdminCreateLessonRequest } from '@/types/lesson'

const { VITE_API_BASE_URL } = import.meta.env

export const useMyLessons = (filters: LessonFilters) => {
  return useQuery({
    queryKey: ['my-lessons', filters],
    queryFn: () => userLessonApi.getMyLessons(filters),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    enabled: !!filters.languageId,
  })
}

export const useGenerateMyLessonWithAI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: AdminCreateLessonRequest) =>
      userLessonApi.generateLessonWithAI(request),
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


