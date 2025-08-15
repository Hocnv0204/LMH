import { createFileRoute } from '@tanstack/react-router'
import HistoryPage from '@/features/admin/history'

export const Route = createFileRoute('/admin/history/')({
  component: HistoryPage,
})
