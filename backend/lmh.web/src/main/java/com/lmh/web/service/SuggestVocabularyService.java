package com.lmh.web.service;

import com.lmh.web.dto.request.suggest.SuggestVocabularyRequest;
import com.lmh.web.dto.response.suggest.SuggestVocabularyResponse;
import org.springframework.data.domain.Page;

public interface SuggestVocabularyService {
    Page<SuggestVocabularyResponse> getSuggestVocabulariesByLessonId(Integer lessonId,
                                                                         int size, int page, String sortBy);
} 