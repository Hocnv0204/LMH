import { apiClient } from './client';
import { buildApiUrl } from '@/config/api';

export interface SuggestVocabularyResponse {
  id: number;
  term: string;
  vietnamese: string;
  type: string;
  pronunciation: string;
  example: string;
}

export const suggestVocabularyApi = {
  getSuggestVocabulariesByLesson: async (lessonId: number, params?: {
    size?: number;
    page?: number;
    sortBy?: string;
  }) => {
    const queryParams = new URLSearchParams({
      size: (params?.size || 10).toString(),
      page: (params?.page || 0).toString(),
      sortBy: params?.sortBy || 'id'
    });

    const url = buildApiUrl(`/user/suggest-vocabulary/${lessonId}?${queryParams.toString()}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch suggested vocabulary: ${response.statusText}`);
    }

    const data = await response.json();
    return { data: data.data || data };
  }
};