export interface AdminLessonSummaryResponse {
  id: number
  name: string
  topicName: string
  levelName: string
  languageName: string
  createdAt: string
  deleteFlag: boolean
}

export interface AdminLessonDetailResponse {
  id: number
  name: string
  paragraph?: string
  note?: string
  description?: string
  deleteFlag: boolean
  createdAt: string
  updatedAt: string
  topicName: string
  levelName: string
  languageName: string
  suggestVocabularies: SuggestVocabularyResponse[]
}

export interface SuggestVocabularyResponse {
  id: number
  term: string
  vietnamese: string
  type: string
  pronunciation: string
  example: string
  deleteFlag: boolean
}

export interface AdminCreateLessonRequest {
  draftName: string
  topicId: number
  levelId: number
  languageId: number
  description: string
}

export interface AdminUpdateLessonRequest {
  name?: string
  paragraph?: string
  note?: string
  description?: string
}

export interface AdminUpdateSuggestVocabularyRequest {
  term: string
  vietnamese: string
  type: string
  pronunciation: string
  example: string
}

export interface LessonFilters {
  searchTerm?: string
  topicId?: number
  levelId?: number
  languageId: number // Required - no "All Languages" option
  isDeleted?: boolean
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}

export interface LessonGenerationResponse {
  id: number
  status: string
  message: string
}

export interface TopicOption {
  id: number
  name: string
}

export interface LevelOption {
  id: number
  name: string
}

export interface LanguageOption {
  id: number
  name: string
}
