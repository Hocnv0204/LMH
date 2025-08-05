export interface VocabularyItem {
  id: number;
  term: string;
  vietnamese: string;
  type: string;
  pronunciation?: string;
  example?: string;
}

export interface SuggestVocabularyResponse {
  content: VocabularyItem[];
}

export const suggestVocabularyApi = {
  getSuggestVocabulariesByLesson: async (lessonId: number) => {
    // Implementation without apiClient
    return { data: { content: [] } };
  }
};
