import { createFileRoute, Outlet } from '@tanstack/react-router'
import { IndexTopBar } from '@/components/layout/index-top-bar'

export const Route = createFileRoute('/user')({
  component: UserLayout,
})

function UserLayout() {
  return (
    <div className='bg-background min-h-screen'>
      <IndexTopBar />
      <Outlet />
    </div>
  )
}
