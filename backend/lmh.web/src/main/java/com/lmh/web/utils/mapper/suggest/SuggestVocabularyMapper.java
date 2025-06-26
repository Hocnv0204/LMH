package com.lmh.web.utils.mapper.suggest;

import com.lmh.web.dto.response.suggest.SuggestVocabularyResponse;
import com.lmh.web.model.SuggestVocabulary;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SuggestVocabularyMapper {
    SuggestVocabularyResponse toResponse(SuggestVocabulary suggestVocabulary);
    
    List<SuggestVocabularyResponse> toResponseList(List<SuggestVocabulary> suggestVocabularies);
} 