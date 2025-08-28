import { buildApiUrl } from '@/config/api'
import { fetchApi } from '@/api/api'
import { apiClient } from '@/api/client'
import { VocabularyItem } from './suggestVocabulary'

export interface LessonResponse {
  id: number
  name: string
  description: string
  paragraph: string
  note?: string
  status: string
  type: string
  createdAt: string
  updatedAt?: string
  suggestVocabularies?: VocabularyItem[]
}

export interface CreateLessonRequest {
  name: string
  description: string
  paragraph: string
  note?: string
  topicName: string
  languageRequest: { name: string }
  levelRequest: { name: string }
}

export interface UpdateLessonRequest {
  name: string
  description: string
  paragraph: string
  note?: string
  topicName?: string
}

export const lessonApi = {
  getLessonById: async (lessonId: number) => {
    try {
      const url = buildApiUrl(`/user/lessons/${lessonId}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch lesson: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      return { data: data.data || data }
    } catch (error) {
      console.error('Error fetching lesson:', error)
      throw error
    }
  },

  getLessons: (params: {
    userId: number
    levelName: string
    languageName: string
    topicName: string
    size?: number
    page?: number
    sortBy?: string
  }) => apiClient.get('/user/lesson', { params }),

  createLesson: async (username: string, lessonData: CreateLessonRequest) => {
    try {
      const url = buildApiUrl(`/user/lesson/${username}/add-lesson`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to create lesson: ${response.statusText}`
        )
      }

      const data = await response.json()
      return { data: data.data || data }
    } catch (error) {
      console.error('Error creating lesson:', error)
      throw error
    }
  },

  updateLesson: async (username: string, lessonData: UpdateLessonRequest) => {
    try {
      const url = buildApiUrl(`/user/lesson/${username}/update-lesson`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to update lesson: ${response.statusText}`
        )
      }

      const data = await response.json()
      return { data: data.data || data }
    } catch (error) {
      console.error('Error updating lesson:', error)
      throw error
    }
  },

  deleteLesson: async (username: string, lessonName: string) => {
    try {
      const url = buildApiUrl(
        `/user/lesson/${username}/delete-lesson?lessonName=${encodeURIComponent(lessonName)}`
      )
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to delete lesson: ${response.statusText}`
        )
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      throw error
    }
  },
}
