import type { CustomResponse, PageResponse } from '@/types/common'
import { fetchApi } from '@/api/api'
import type {
  LessonFilters,
  LessonGenerationResponse,
  AdminCreateLessonRequest,
} from '@/types/lesson'
import type { LessonSummaryResponse } from '@/features/lesson-discovery/types/lesson-selection'

export const userLessonApi = {
  getMyLessons: async (
    filters: LessonFilters
  ): Promise<CustomResponse<PageResponse<LessonSummaryResponse>>> => {
    const params = new URLSearchParams()
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.topicId) params.append('topicId', filters.topicId.toString())
    if (filters.levelId) params.append('levelId', filters.levelId.toString())
    params.append('languageId', filters.languageId.toString())
    params.append('page', filters.page.toString())
    params.append('size', filters.size.toString())
    params.append('sortBy', filters.sortBy)
    params.append('sortDir', filters.sortDir)

    return fetchApi(`/user/lessons/my-creations?${params.toString()}`)
  },

  generateLessonWithAI: async (
    request: AdminCreateLessonRequest
  ): Promise<CustomResponse<LessonGenerationResponse>> => {
    return fetchApi('/user/lessons/generate-with-ai', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
    })
  },
}


