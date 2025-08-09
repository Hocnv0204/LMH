import { createFileRoute } from '@tanstack/react-router'
import LanguagesManagementPage from '@/features/admin/language'

export const Route = createFileRoute('/admin/language/')({
  component: LanguagesManagementPage,
})
