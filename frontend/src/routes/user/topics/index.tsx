import { createFileRoute, redirect } from '@tanstack/react-router'
import TopicsPage from '@/features/user/topics'

interface TopicsSearch {
  levelId: number
  levelName: string
  languageName: string
}

export const Route = createFileRoute('/user/topics/')({
  beforeLoad: ({ search }) => {
    const s = search as Record<string, unknown>
    const levelId = Number(s.levelId)
    const levelName = String(s.levelName || '')
    const languageName = String(s.languageName || '')
    if (!languageName || !levelName || !Number.isFinite(levelId)) {
      throw redirect({ to: '/user/level' })
    }
  },
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