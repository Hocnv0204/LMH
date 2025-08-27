import { CustomResponse, PageResponse } from '@/types/common.ts'
import type {
  AdminLessonSummaryResponse,
  AdminLessonDetailResponse,
  AdminCreateLessonRequest,
  AdminUpdateLessonRequest,
  AdminUpdateSuggestVocabularyRequest,
  LessonFilters,
  LessonGenerationResponse,
  TopicOption,
  LevelOption,
  LanguageOption,
} from '@/types/lesson'
import { fetchApi } from '@/api/api.ts'

export const lessonApi = {
  getAllLessons: async (
    filters: LessonFilters
  ): Promise<CustomResponse<PageResponse<AdminLessonSummaryResponse>>> => {
    const params = new URLSearchParams()

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.topicId) params.append('topicId', filters.topicId.toString())
    if (filters.levelId) params.append('levelId', filters.levelId.toString())
    params.append('languageId', filters.languageId.toString()) // Always required
    if (filters.isDeleted !== undefined)
      params.append('isDeleted', filters.isDeleted.toString())
    params.append('page', filters.page.toString())
    params.append('size', filters.size.toString())
    params.append('sortBy', filters.sortBy)
    params.append('sortDir', filters.sortDir)

    return fetchApi(`/admin/lessons?${params.toString()}`)
  },

  getLessonDetails: async (
    lessonId: number
  ): Promise<CustomResponse<AdminLessonDetailResponse>> => {
    return fetchApi(`/admin/lessons/${lessonId}`)
  },

  generateLessonWithAI: async (
    request: AdminCreateLessonRequest
  ): Promise<CustomResponse<LessonGenerationResponse>> => {
    return fetchApi('/admin/lessons/generate-with-ai', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  updateLesson: async (
    lessonId: number,
    request: AdminUpdateLessonRequest
  ): Promise<CustomResponse<AdminLessonDetailResponse>> => {
    return fetchApi(`/admin/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  },

  updateLessonVocabularies: async (
    lessonId: number,
    vocabularies: AdminUpdateSuggestVocabularyRequest[]
  ): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/lessons/${lessonId}/vocabularies`, {
      method: 'PUT',
      body: JSON.stringify(vocabularies),
    })
  },

  deleteLesson: async (lessonId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/lessons/${lessonId}`, {
      method: 'DELETE',
    })
  },

  restoreLesson: async (lessonId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/lessons/${lessonId}/restore`, {
      method: 'PUT',
    })
  },

  // Helper functions to get options for dropdowns
  getAvailableLanguages: async (): Promise<
    CustomResponse<LanguageOption[]>
  > => {
    return fetchApi('/admin/languages?size=100&isDeleted=false').then(
      (response: any) => ({
        data: response.data.content.map((lang: any) => ({
          id: lang.id,
          name: lang.name,
        })),
      })
    )
  },

  getTopicsByLanguage: async (
    languageId: number
  ): Promise<CustomResponse<TopicOption[]>> => {
    return fetchApi(
      `/admin/topics?languageId=${languageId}&size=100&isDeleted=false`
    ).then((response: any) => ({
      data: response.data.content
        .filter((topic: any) => topic.languageName)
        .map((topic: any) => ({
          id: topic.id,
          name: topic.name,
        })),
    }))
  },

  getLevelsByLanguage: async (
    languageId: number
  ): Promise<CustomResponse<LevelOption[]>> => {
    return fetchApi(`/admin/levels?languageId=${languageId}&size=100`).then(
      (response: any) => ({
        data: response.data.content.map((level: any) => ({
          id: level.id,
          name: level.name,
        })),
      })
    )
  },
}
