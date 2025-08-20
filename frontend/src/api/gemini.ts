import { apiClient } from './client';
import { HistoryResponse } from './history';

export interface GeminiRequest {
  question: string;
  answer: string;
}

export interface GeminiAskResponse {
  data: HistoryResponse;
  message?: string;
  httpStatus?: string;
}

export const geminiApi = {
  askGemini: (username: string, lessonId: number, request: GeminiRequest) =>
    apiClient.post<GeminiAskResponse>(`/user/gemini/ask/${username}/${lessonId}`, request)
};