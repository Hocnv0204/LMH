import { createFileRoute } from '@tanstack/react-router'
import LeaderboardPage from '@/features/leaderboard/LeaderboardPage'

export const Route = createFileRoute('/leaderboard/')({
  component: LeaderboardPageRoute,
})

function LeaderboardPageRoute() {
  return <LeaderboardPage />
}
