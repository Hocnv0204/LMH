import { createFileRoute } from '@tanstack/react-router'
import UsersManagementPage from '@/features/admin/manage_user'

export const Route = createFileRoute('/admin/user/')({
  component: UsersManagementPage,
})
