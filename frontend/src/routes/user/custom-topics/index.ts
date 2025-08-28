import { createFileRoute } from '@tanstack/react-router'
import CustomTopicsPage from '@/features/user/custom-topic/CustomTopicsPage'

export const Route = createFileRoute('/user/custom-topics/')({
  component: CustomTopicsPage,
})
