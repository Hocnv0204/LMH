package com.lmh.web.service.impl;

import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.suggest.SuggestVocabularyRequest;
import com.lmh.web.dto.response.suggest.SuggestVocabularyResponse;
import com.lmh.web.model.SuggestVocabulary;
import com.lmh.web.repository.SuggestVocabularyRepository;
import com.lmh.web.service.SuggestVocabularyService;
import com.lmh.web.utils.mapper.suggest.SuggestVocabularyMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuggestVocabularyServiceImpl implements SuggestVocabularyService {
    
    private final SuggestVocabularyRepository suggestVocabularyRepository;
    private final SuggestVocabularyMapper suggestVocabularyMapper;

    @Override
    public Page<SuggestVocabularyResponse> getSuggestVocabulariesByLessonId(Integer lessonId,
                                                                                int size, int page, String sortBy) {
        log.info("Lấy danh sách từ vựng gợi ý cho lesson ID: {}", lessonId);
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        Page<SuggestVocabulary> suggestVocabularyPage = suggestVocabularyRepository
                .findSuggestVocabulariesByLessonId(lessonId,
                        pageable);
        log.info("Lấy danh sách từ vựng gợi ý thành công: {} từ vựng cho lesson ID: {}", 
                suggestVocabularyPage.getTotalElements(), lessonId);
        return mapToPageResponse(suggestVocabularyPage);
    }

    public Page<SuggestVocabularyResponse> mapToPageResponse(Page<SuggestVocabulary> suggestVocabularyPage) {
        List<SuggestVocabularyResponse> content = suggestVocabularyMapper.toResponseList(suggestVocabularyPage.getContent());
        return new PageImpl<>(content, suggestVocabularyPage.getPageable(), suggestVocabularyPage.getTotalElements());
    }
} 