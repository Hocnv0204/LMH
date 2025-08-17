import { createFileRoute } from '@tanstack/react-router'
import { QuizSetupPage } from '@/features/quiz/QuizSetupPage'

export const Route = createFileRoute('/quiz/setup')({
  component: QuizSetupComponent,
})

function QuizSetupComponent() {
  return <QuizSetupPage />
}
