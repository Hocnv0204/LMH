export interface Language {
  id: number
  name: string
}

export interface AdminTopicResponse {
  id: number
  name: string
  description: string
  createdAt: string
  imageUrl: string
  deleteFlag: boolean
  languageName: string
  lessonCount: number
}

export interface AdminCreateTopicRequest {
  name: string
  description: string
  note?: string
  languageRequest: {
    id?: number
    name: string
  }
}

export interface AdminUpdateTopicRequest {
  name?: string
  description?: string
  note?: string
  languageRequest?: {
    id?: number
    name: string
  }
}

export interface TopicFilters {
  searchTerm?: string
  languageName?: string
  isDeleted?: boolean
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}
