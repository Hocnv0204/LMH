import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthProvider } from '@/context/auth-context'
import { NavigationProgress } from '@/components/navigation-progress'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <NavigationProgress />
      <Outlet />
      {import.meta.env.MODE === 'development' && (
        <>
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </AuthProvider>
  ),
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
