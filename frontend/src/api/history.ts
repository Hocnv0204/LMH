import { fetchApi } from '@/api/api';

export interface HistoryResponse {
  id: number;
  question: string;
  answer: string;
  result: string; // JSON string that needs to be parsed
  createdAt?: string;
  lesson?: {
    id: number;
    name: string;
  };
}

export interface ParsedHistoryResult {
  score: number;
  status: 'perfect' | 'good' | 'needs_improvement';
  message?: string;
  comment?: string;
  improvement_suggestions?: string;
  correct_answer?: string;
  suggestion_markdown?: string;
  improvements?: string[];
  suggestion_html?: string;
  rich_html?: string;
}

export const historyApi = {
  getHistoryByUser: async (username: string, page = 0, size = 100): Promise<{ data: { content: HistoryResponse[] } }> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy: 'id'
    });

    return fetchApi<{ data: { content: HistoryResponse[] } }>(
      `/user/histories/${username}?${queryParams.toString()}`,
      { method: 'GET' }
    );
  },

  getHistoryByUserAndLesson: async (username: string, lessonId: number, page = 0, size = 100): Promise<{ data: { content: HistoryResponse[] } }> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy: 'id'
    });

    return fetchApi<{ data: { content: HistoryResponse[] } }>(
      `/user/histories/${username}/${lessonId}?${queryParams.toString()}`,
      { method: 'GET' }
    );
  }
};

