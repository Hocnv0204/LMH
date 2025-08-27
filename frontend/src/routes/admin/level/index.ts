import { createFileRoute } from '@tanstack/react-router'
import LevelsManagementPage from '@/features/admin/manage_level'

export const Route = createFileRoute('/admin/level/')({
  component: LevelsManagementPage,
})
