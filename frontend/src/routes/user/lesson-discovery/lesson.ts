// user/lesson-discovery/lessons.ts
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import LessonSelectionPage from '@/features/lesson-discovery/pages/LessonSelectionPage'

// Schema để xác thực các search params
// Đảm bảo các tham số cần thiết phải có mặt và đúng kiểu dữ liệu
const lessonSearchSchema = z.object({
  languageName: z.string().min(1),
  topicId: z.coerce.number().int().min(1), // coerce.number() để ép kiểu từ string sang number
  topicName: z.string().min(1),
})

export const Route = createFileRoute('/user/lesson-discovery/lesson')({
  // Validate search params từ URL
  validateSearch: (search: Record<string, unknown>) => {
    return lessonSearchSchema.parse(search)
  },
  component: LessonSelectionPage,
})
