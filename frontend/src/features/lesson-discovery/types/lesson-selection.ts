export interface AllLanguageResponse {
  name: string
  id: string
}

export interface LevelResponse {
  id: number
  name: string
}

export interface TopicResponse {
  id: number
  name: string
  description: string
  createdAt: string
  deleteFlag: boolean
  languageName: string
}

export interface LessonSummaryResponse {
  id: number
  name: string
  description: string
  createdAt: string
  levelName: string
}

export interface TopicFilters {
  searchTerm?: string
  languageName?: string
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}

export interface LessonFilters {
  searchTerm?: string
  topicId?: number
  levelId?: number
  languageId: number
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}
