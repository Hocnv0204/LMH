import { createFileRoute } from '@tanstack/react-router'
import LessonsManagementPage from '@/features/admin/lesson'

export const Route = createFileRoute('/admin/lesson/')({
  component: LessonsManagementPage,
})
