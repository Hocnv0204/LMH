// user/lesson-discovery/index.ts
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import TopicSelectionPage from '@/features/lesson-discovery/pages/TopicSelectionPage'

// Schema để validate search params trên URL
const discoverySearchSchema = z.object({
  // languageName là một string, nếu không có trên URL, mặc định là 'Tiếng Anh'
  languageName: z.string().optional().default('Tiếng Anh'),
})

export const Route = createFileRoute('/user/lesson-discovery/')({
  // Áp dụng validateSearch vào route
  validateSearch: discoverySearchSchema,
  component: TopicSelectionPage,
})
