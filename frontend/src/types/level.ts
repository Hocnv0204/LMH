export interface AdminLevelResponse {
  id: number
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  deleteFlag: boolean
  languageName: string
}

export interface AdminCreateLevelRequest {
  name: string
  description?: string
  languageId: number
}

export interface AdminUpdateLevelRequest {
  name?: string
  description?: string
  languageId?: number
}

export interface LevelResponse {
  id: number
  name: string
}

export interface LevelFilters {
  searchTerm?: string
  languageId?: number
  isDeleted?: boolean
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}

export interface Level {
  id: number
  name: string
  description?: string
}
