import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/features/admin/components/admin-layout'
import { authService } from '@/api/auth'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      const isAuth = await authService.isAuthenticated()
      
      if (!isAuth || !currentUser || currentUser.role !== 'ADMIN') {
        throw redirect({
          to: '/',
        })
      }
    } catch (error) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AdminLayout,
})
