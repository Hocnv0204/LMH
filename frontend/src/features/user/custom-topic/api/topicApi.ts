import type { CustomResponse, PageResponse } from '@/types/common'
import { fetchApi } from '@/api/api'
import type {
  TopicRequest,
  TopicResponse,
  TopicFilters,
} from '@/features/user/custom-topic/types/topic'

export const topicApi = {
  /**
   * Get user's created topics
   */
  getMyTopics: async (
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

    return fetchApi(`/user/topics/my-topics?${params.toString()}`)
  },

  /**
   * Create a new topic
   */
  createTopic: async (
    request: TopicRequest,
    file?: File
  ): Promise<CustomResponse<TopicResponse>> => {
    const formData = new FormData()
    formData.append('request', JSON.stringify(request))
    if (file) {
      formData.append('file', file)
    }
    return fetchApi('/user/topics', {
      method: 'POST',
      body: formData,
    })
  },

  /**
   * Update an existing topic
   */
  updateTopic: async (
    topicId: number,
    request: TopicRequest,
    file?: File
  ): Promise<CustomResponse<TopicResponse>> => {
    const formData = new FormData()
    formData.append('request', JSON.stringify(request))
    if (file) {
      formData.append('file', file)
    }
    return fetchApi(`/user/topics/${topicId}`, {
      method: 'PUT',
      body: formData,
    })
  },

  /**
   * Delete a topic
   */
  deleteTopic: async (topicId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/user/topics/${topicId}`, {
      method: 'DELETE',
    })
  },
}
