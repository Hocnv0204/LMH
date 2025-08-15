export interface UserProfileResponse {
  id: number
  name: string
  username: string
  email: string
  phoneNumber?: string
  dateOfBirth?: string
  school?: string
  point: number
  credit: number
  createdAt: string
  lastLogin?: string
  apiKey?: string
  apiUrl?: string
}

export interface UpdateProfileRequest {
  name?: string
  dateOfBirth?: string
  school?: string
}

export interface UpdateApiConfigRequest {
  apiKey?: string
  apiUrl?: string
}

export interface UserHistoryResponse {
  id: number
  question: string
  result: string
  answer: string
  createdAt: string
  lessonId: number
  lessonName: string
}

export interface UserHistoryFilters {
  page: number
  size: number
}
