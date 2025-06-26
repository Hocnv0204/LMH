package com.lmh.web.service.impl;

import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.suggest.SuggestVocabularyRequest;
import com.lmh.web.dto.response.suggest.SuggestVocabularyResponse;
import com.lmh.web.model.SuggestVocabulary;
import com.lmh.web.repository.SuggestVocabularyRepository;
import com.lmh.web.service.SuggestVocabularyService;
import com.lmh.web.utils.mapper.suggest.SuggestVocabularyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuggestVocabularyServiceImpl implements SuggestVocabularyService {
    
    private final SuggestVocabularyRepository suggestVocabularyRepository;
    private final SuggestVocabularyMapper suggestVocabularyMapper;

    @Override
    public Page<SuggestVocabularyResponse> getSuggestVocabulariesByLessonAndUser(SuggestVocabularyRequest request, 
                                                                                int size, int page, String sortBy) {
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        Page<SuggestVocabulary> suggestVocabularyPage = suggestVocabularyRepository
                .findSuggestVocabulariesByLessonAndUser(
                        request.getLessonName(),
                        request.getUserRequest().getId(),
                        pageable);
        return mapToPageResponse(suggestVocabularyPage);
    }

    public Page<SuggestVocabularyResponse> mapToPageResponse(Page<SuggestVocabulary> suggestVocabularyPage) {
        List<SuggestVocabularyResponse> content = suggestVocabularyMapper.toResponseList(suggestVocabularyPage.getContent());
        return new PageImpl<>(content, suggestVocabularyPage.getPageable(), suggestVocabularyPage.getTotalElements());
    }
} 