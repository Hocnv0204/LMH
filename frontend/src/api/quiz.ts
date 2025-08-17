import { api } from './client'

export interface QuizStartRequest {
  collectionId: number
  questionCount: number
  seed?: number
}

export interface QuizStartResponse {
  // Direct format (current backend)
  sessionId?: string
  collectionId?: number
  totalQuestions?: number
  currentQuestionNumber?: number
  message?: string
  // Wrapped format (future/documentation)
  success?: boolean
  data?: {
    sessionId: string
    collectionId: number
    totalQuestions: number
    currentQuestionNumber: number
    message: string
  }
}

export interface QuizQuestion {
  questionId: string
  question: string
  options: string[]
  correctAnswer: string | null
  isCorrect: boolean
  message: string
  isCompleted: boolean
  currentQuestionNumber: number
  totalQuestions: number
}

export interface QuizAnswerRequest {
  quizId: string
  questionId: string
  selectedAnswer: string
}

export interface QuizAnswerResponse {
  // Direct format (current backend)
  correct?: boolean
  message?: string
  nextQuestion?: QuizQuestion
  isCompleted?: boolean
  completed?: boolean // Alternative property name from backend
  currentQuestionNumber?: number
  totalQuestions?: number
  // Wrapped format (future/documentation)
  success?: boolean
  data?: {
    correct: boolean
    message: string
    nextQuestion: QuizQuestion
    isCompleted: boolean
    completed?: boolean // Alternative property name from backend
    currentQuestionNumber: number
    totalQuestions: number
  }
}

export interface QuizQuestionResponse extends QuizQuestion {
  // Direct format (current backend)
  // Wrapped format (future/documentation)
  success?: boolean
  data?: QuizQuestion
}

export const quizApi = {
  // Bắt đầu quiz
  start: async (
    userId: number,
    request: QuizStartRequest
  ): Promise<QuizStartResponse> => {
    const { data } = await api.post<QuizStartResponse>(
      `/api/quiz/start?userId=${userId}`,
      request
    )
    return data
  },

  // Trả lời câu hỏi
  answer: async (
    userId: number,
    request: QuizAnswerRequest
  ): Promise<QuizAnswerResponse> => {
    const { data } = await api.post<QuizAnswerResponse>(
      `/api/quiz/answer?userId=${userId}`,
      request
    )
    return data
  },

  // Lấy câu hỏi hiện tại
  getCurrentQuestion: async (
    quizId: string,
    userId: number
  ): Promise<QuizQuestionResponse> => {
    const { data } = await api.get<QuizQuestionResponse>(
      `/api/quiz/question?quizId=${quizId}&userId=${userId}`
    )
    return data
  },

  // Kết thúc quiz
  finish: async (
    quizId: string,
    userId: number
  ): Promise<{ success: boolean; data: string }> => {
    const { data } = await api.post<{ success: boolean; data: string }>(
      `/api/quiz/finish?quizId=${quizId}&userId=${userId}`
    )
    return data
  },
}
