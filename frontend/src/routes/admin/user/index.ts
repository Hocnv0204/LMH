import { createFileRoute } from '@tanstack/react-router'
import UsersManagementPage from '@/features/admin/user'

export const Route = createFileRoute('/admin/user/')({
  component: UsersManagementPage,
})
