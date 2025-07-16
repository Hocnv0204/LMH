import { createFileRoute } from '@tanstack/react-router'
import TopicManagementPage from '@/features/admin/topic'

export const Route = createFileRoute('/admin/topic/')({
  component: TopicManagementPage,
})
