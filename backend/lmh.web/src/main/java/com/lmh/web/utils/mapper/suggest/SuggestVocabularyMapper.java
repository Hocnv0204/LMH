package com.lmh.web.utils.mapper.suggest;

import com.lmh.web.dto.request.suggest.AdminUpdateSuggestVocabularyRequest;
import com.lmh.web.dto.response.suggest.SuggestVocabularyResponse;
import com.lmh.web.model.SuggestVocabulary;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SuggestVocabularyMapper {
    SuggestVocabularyResponse toResponse(SuggestVocabulary suggestVocabulary);
    
    List<SuggestVocabularyResponse> toResponseList(List<SuggestVocabulary> suggestVocabularies);

    // Bỏ qua việc map 'lesson' vì chúng ta sẽ gán nó thủ công trong service
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    SuggestVocabulary toEntity(AdminUpdateSuggestVocabularyRequest dto);
}