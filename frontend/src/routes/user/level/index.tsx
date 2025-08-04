import { createFileRoute } from '@tanstack/react-router'
import LevelSelection from '@/features/user/level-selection'

export const Route = createFileRoute('/user/level/')({
  component: LevelSelectionPage,
})

function LevelSelectionPage() {
  return <LevelSelection />
}