export interface TopicRequest {
  name: string
  description: string
  languageRequest: {
    name: string
  }
}

export interface TopicResponse {
  id: number
  name: string
  description: string
  createdAt: string
  languageName: string
}

export interface TopicFilters {
  searchTerm?: string
  languageName?: string
  page: number
  size: number
  sortBy: string
  sortDir: string
}
