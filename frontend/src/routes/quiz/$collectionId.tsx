import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { QuizPage } from '@/features/quiz/QuizPage'

type QuizSearch = {
  questionCount?: number
}

export const Route = createFileRoute('/quiz/$collectionId')({
  component: QuizComponent,
  validateSearch: (search: Record<string, unknown>): QuizSearch => {
    return {
      questionCount: search.questionCount
        ? Number(search.questionCount)
        : undefined,
    }
  },
})

function QuizComponent() {
  const { collectionId } = Route.useParams()
  const { questionCount } = Route.useSearch()
  const navigate = useNavigate()

  const handleQuizComplete = () => {
    // Navigate back to collections or vocabulary page
    navigate({ to: '/vocab' })
  }

  const handleQuizExit = () => {
    // Navigate back with confirmation
    navigate({ to: '/vocab' })
  }

  return (
    <QuizPage
      collectionId={parseInt(collectionId)}
      questionCount={questionCount}
      onComplete={handleQuizComplete}
      onExit={handleQuizExit}
    />
  )
}
