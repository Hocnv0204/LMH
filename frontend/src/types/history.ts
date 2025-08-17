export interface AdminHistoryResponse {
  id: number
  question: string
  answer: string
  result: string
  createdAt: string
  userId: number
  userName: string
  lessonId: number
  lessonName: string
}

export interface TopLessonStatsResponse {
  lessonId: number
  lessonName: string
  submissionCount: number
}

export interface TopUserStatsResponse {
  userId: number
  username: string
  submissionCount: number
}

export type TimePeriod = 'today' | 'this-week' | 'this-month'

export interface HistoryFilters {
  timePeriod: TimePeriod
  page: number
  size: number
  sortBy: string
  sortDir: 'ASC' | 'DESC'
}
