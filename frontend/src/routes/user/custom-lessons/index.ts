import { createFileRoute } from '@tanstack/react-router'
import { CustomLessonsPage } from '@/features/user/custom-lesson/CustomLessonsPage'

export const Route = createFileRoute('/user/custom-lessons/')({
  component: CustomLessonsPage,
})
