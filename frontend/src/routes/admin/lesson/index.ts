import { createFileRoute } from '@tanstack/react-router'
import LessonsManagementPage from '@/features/admin/manage_lesson'

export const Route = createFileRoute('/admin/lesson/')({
  component: LessonsManagementPage,
})
