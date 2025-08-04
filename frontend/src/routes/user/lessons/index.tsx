import { createFileRoute } from '@tanstack/react-router'
import LessonsPage from '@/features/user/lessons'

interface LessonsSearch {
  levelId: number
  levelName: string
  languageName: string
  topicId?: number
  topicName?: string
}

export const Route = createFileRoute('/user/lessons/')({
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
  
  return (
    <LessonsPage 
      levelId={levelId}
      levelName={levelName}
      languageName={languageName}
      topicId={topicId}
      topicName={topicName}
      userId={1} // Replace with actual user ID from auth context
    />
  )
}

