import { apiClient } from './client';

export interface GeminiRequest {
  question: string;
  answer: string;
}

export interface GeminiValidationResponse {
  score: number;
  status: 'perfect' | 'good' | 'needs_improvement';
  message?: string;
  comment?: string;
  improvement_suggestions?: string;
  correct_answer?: string;
}

export const geminiApi = {
  askGemini: (username: string, lessonId: number, request: GeminiRequest) =>
    apiClient.post<GeminiValidationResponse>(`/user/gemini/ask/${username}/${lessonId}`, request)
};