import { CustomResponse, PageResponse } from '@/types/common.ts'
import type {
  AdminTopicResponse,
  AdminCreateTopicRequest,
  AdminUpdateTopicRequest,
  TopicFilters,
} from '@/types/topic.ts'
import { fetchApi } from '@/api/api.ts'

export const topicApi = {
  getAllTopics: async (
    filters: TopicFilters
  ): Promise<CustomResponse<PageResponse<AdminTopicResponse>>> => {
    const params = new URLSearchParams()

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.languageName)
      params.append('languageName', filters.languageName)
    if (filters.isDeleted !== undefined)
      params.append('isDeleted', filters.isDeleted.toString())
    params.append('page', filters.page.toString())
    params.append('size', filters.size.toString())
    params.append('sortBy', filters.sortBy)
    params.append('sortDir', filters.sortDir)

    return fetchApi(`/admin/topics?${params.toString()}`)
  },

  getTopicDetails: async (
    topicId: number
  ): Promise<CustomResponse<AdminTopicResponse>> => {
    return fetchApi(`/admin/topics/${topicId}`)
  },

  createTopic: (
    request: AdminCreateTopicRequest,
    file?: File
  ): Promise<CustomResponse<AdminTopicResponse>> => {
    const formData = new FormData()
    formData.append('request', JSON.stringify(request))
    if (file) {
      formData.append('file', file)
    }
    return fetchApi('/admin/topics', {
      method: 'POST',
      body: formData,
    })
  },

  updateTopic: (
    topicId: number,
    request: AdminUpdateTopicRequest,
    file?: File
  ): Promise<CustomResponse<AdminTopicResponse>> => {
    const formData = new FormData()
    formData.append('request', JSON.stringify(request))
    if (file) {
      formData.append('file', file)
    }
    return fetchApi(`/admin/topics/${topicId}`, {
      method: 'PUT',
      body: formData,
    })
  },

  deleteTopic: async (topicId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/topics/${topicId}`, {
      method: 'DELETE',
    })
  },

  restoreTopic: async (topicId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/topics/${topicId}/restore`, {
      method: 'POST',
    })
  },
}
