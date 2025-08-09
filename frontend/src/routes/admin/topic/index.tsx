import { createFileRoute } from '@tanstack/react-router'
import TopicsManagementPage from '@/features/admin/topic'

export const Route = createFileRoute('/admin/topic/')({
  component: TopicsManagementPage,
})
