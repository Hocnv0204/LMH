import { createFileRoute } from '@tanstack/react-router'
import TopicsManagementPage from '@/features/admin/manage_topic'

export const Route = createFileRoute('/admin/topic/')({
  component: TopicsManagementPage,
})
