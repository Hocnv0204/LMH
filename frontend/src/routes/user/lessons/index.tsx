import { createFileRoute, redirect } from '@tanstack/react-router'
import LessonsPage from '@/features/user/lessons'
import { useAuth } from '@/context/auth-context'

interface LessonsSearch {
  levelId: number
  levelName: string
  languageName: string
  topicId?: number
  topicName?: string
}

export const Route = createFileRoute('/user/lessons/')({
  beforeLoad: ({ search }) => {
    const s = search as Record<string, unknown>
    const levelId = Number(s.levelId)
    const levelName = String(s.levelName || '')
    const languageName = String(s.languageName || '')
    if (!languageName || !levelName || !Number.isFinite(levelId)) {
      throw redirect({ to: '/user/level' })
    }
  },
  component: LessonsPageComponent,
  validateSearch: (search: Record<string, unknown>): LessonsSearch => {
    return {
      levelId: Number(search.levelId),
      levelName: String(search.levelName || ''),
      languageName: String(search.languageName || ''),
      topicId: search.topicId ? Number(search.topicId) : undefined,
      topicName: search.topicName ? String(search.topicName) : undefined
    }
  }
})

function LessonsPageComponent() {
  const { levelId, levelName, languageName, topicId, topicName } = Route.useSearch()
  const { user, isLoading } = useAuth()

  if (isLoading || !user?.id) return null

  return (
    <LessonsPage 
      levelId={levelId}
      levelName={levelName}
      languageName={languageName}
      topicId={topicId}
      topicName={topicName}
      userId={Number(user.id)}
    />
  )
}