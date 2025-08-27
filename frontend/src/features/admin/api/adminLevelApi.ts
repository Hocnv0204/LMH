import { CustomResponse, PageResponse } from '@/types/common.ts'
import type {
  AdminLevelResponse,
  AdminCreateLevelRequest,
  AdminUpdateLevelRequest,
  LevelFilters,
} from '@/types/level.ts'
import { fetchApi } from '@/api/api.ts'

export const levelApi = {
  getAllLevels: async (
    filters: LevelFilters
  ): Promise<CustomResponse<PageResponse<AdminLevelResponse>>> => {
    const params = new URLSearchParams()

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.languageId)
      params.append('languageId', filters.languageId.toString())
    if (filters.isDeleted !== undefined)
      params.append('isDeleted', filters.isDeleted.toString())
    params.append('page', filters.page.toString())
    params.append('size', filters.size.toString())
    params.append('sortBy', filters.sortBy)
    params.append('sortDir', filters.sortDir)

    return fetchApi(`/admin/levels?${params.toString()}`)
  },

  getLevelDetails: async (
    levelId: number
  ): Promise<CustomResponse<AdminLevelResponse>> => {
    return fetchApi(`/admin/levels/${levelId}`)
  },

  createLevel: async (
    request: AdminCreateLevelRequest
  ): Promise<CustomResponse<AdminLevelResponse>> => {
    return fetchApi('/admin/levels', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  updateLevel: async (
    levelId: number,
    request: AdminUpdateLevelRequest
  ): Promise<CustomResponse<AdminLevelResponse>> => {
    return fetchApi(`/admin/levels/${levelId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  },

  deleteLevel: async (levelId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/levels/${levelId}`, {
      method: 'DELETE',
    })
  },

  restoreLevel: async (levelId: number): Promise<CustomResponse<string>> => {
    return fetchApi(`/admin/levels/${levelId}/restore`, {
      method: 'PUT',
    })
  },
}
