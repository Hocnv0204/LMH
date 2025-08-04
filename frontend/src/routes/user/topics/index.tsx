import { createFileRoute } from '@tanstack/react-router'
import TopicsPage from '@/features/user/topics'

interface TopicsSearch {
  levelId: number
  levelName: string
  languageName: string
}

export const Route = createFileRoute('/user/topics/')({
  component: TopicsPageComponent,
  validateSearch: (search: Record<string, unknown>): TopicsSearch => {
    return {
      levelId: Number(search.levelId),
      levelName: String(search.levelName || ''),
      languageName: String(search.languageName || '')
    }
  }
})

function TopicsPageComponent() {
  const { levelId, levelName, languageName } = Route.useSearch()
  
  return (
    <TopicsPage 
      levelId={levelId}
      levelName={levelName}
      languageName={languageName}
    />
  )
}