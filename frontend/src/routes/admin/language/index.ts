import { createFileRoute } from '@tanstack/react-router'
import LanguagesManagementPage from '@/features/admin/manage_language'

export const Route = createFileRoute('/admin/language/')({
  component: LanguagesManagementPage,
})
