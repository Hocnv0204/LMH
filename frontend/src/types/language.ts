export interface AdminLanguageResponse {
  id: number
  name: string
  languageCode: string
  note?: string
  createdAt: string
  deleteFlag: boolean
}

export interface AdminCreateLanguageRequest {
  name: string
  languageCode: string
  note?: string
}

export interface Language {
  name: string
}

export interface AdminUpdateLanguageRequest {
  name?: string
  languageCode?: string
  note?: string
}

export interface LanguageResponse {
  data: Language[]
  httpStatus: string
}

export interface LanguageFilters {
  searchTerm?: string
  isDeleted?: boolean
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}

export interface LanguageOption {
  id: number
  name: string
}
