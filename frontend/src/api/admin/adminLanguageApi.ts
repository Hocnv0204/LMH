import { CustomResponse, PageResponse } from '@/types/common.ts'
import type {
  AdminLanguageResponse,
  AdminCreateLanguageRequest,
  AdminUpdateLanguageRequest,
  LanguageFilters,
} from '@/types/language.ts'
import { fetchApi } from './apiClient.ts'

export const languageApi = {
  getAllLanguages: async (
    filters: LanguageFilters
  ): Promise<CustomResponse<PageResponse<AdminLanguageResponse>>> => {
    const params = new URLSearchParams()

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.isDeleted !== undefined)
      params.append('isDeleted', filters.isDeleted.toString())
    params.append('page', filters.page.toString())
    params.append('size', filters.size.toString())
    params.append('sortBy', filters.sortBy)
    params.append('sortDir', filters.sortDir)

    return fetchApi(`/admin/languages?${params.toString()}`)
  },

  getLanguageDetails: async (
    languageId: number
  ): Promise<CustomResponse<AdminLanguageResponse>> => {
    return fetchApi(`/admin/languages/${languageId}`)
  },

  createLanguage: async (
    request: AdminCreateLanguageRequest
  ): Promise<CustomResponse<AdminLanguageResponse>> => {
    return fetchApi('/admin/languages', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  updateLanguage: async (
    languageId: number,
    request: AdminUpdateLanguageRequest
  ): Promise<CustomResponse<AdminLanguageResponse>> => {
    return fetchApi(`/admin/languages/${languageId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  },

  deleteLanguage: async (
    languageId: number
  ): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/languages/${languageId}`, {
      method: 'DELETE',
    })
  },

  restoreLanguage: async (
    languageId: number
  ): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/languages/${languageId}/restore`, {
      method: 'PUT',
    })
  },
}
