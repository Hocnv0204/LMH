import { CustomResponse, PageResponse } from '@/types/common.ts'
import { fetchApi } from '@/api/api.ts'
import type {
  AllLanguageResponse,
  LevelResponse,
  TopicResponse,
  LessonSummaryResponse,
  TopicFilters,
  LessonFilters,
} from '@/features/lesson-discovery/types/lesson-selection'

export const userLearningApi = {
  getAllLanguages: async (): Promise<CustomResponse<AllLanguageResponse[]>> => {
    return fetchApi('/user/languages')
  },

  getLevelsByLanguage: async (
    languageName: string
  ): Promise<CustomResponse<LevelResponse[]>> => {
    const params = new URLSearchParams()
    params.append('languageName', languageName)
    return fetchApi(`/user/levels?${params.toString()}`)
  },

  getTopics: async (
    filters: TopicFilters
  ): Promise<CustomResponse<PageResponse<TopicResponse>>> => {
    const params = new URLSearchParams()

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.languageName)
      params.append('languageName', filters.languageName)
    params.append('page', filters.page.toString())
    params.append('size', filters.size.toString())
    params.append('sortBy', filters.sortBy)
    params.append('sortDir', filters.sortDir)

    return fetchApi(`/user/topics?${params.toString()}`)
  },

  getLessons: async (
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

    return fetchApi(`/user/lessons?${params.toString()}`)
  },
}
