package com.lmh.web.utils.mapper.lesson;

import com.lmh.web.dto.request.lesson.AdminUpdateLessonRequest;
import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.response.lesson.AdminLessonDetailResponse;
import com.lmh.web.dto.response.lesson.AdminLessonSummaryResponse;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.dto.response.lesson.LessonSummaryResponse;
import com.lmh.web.model.Lesson;
import com.lmh.web.utils.mapper.suggest.SuggestVocabularyMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring",
        uses = {SuggestVocabularyMapper.class}, // Sử dụng mapper của vocabulary
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface LessonMapper {
    // USER //
    LessonResponse toResponse(Lesson lesson);
    Lesson toEntity(LessonRequest request);
    List<LessonResponse> toResponseList(List<Lesson> lessons);

    @Mapping(target = "levelName", source = "level.name")
    LessonSummaryResponse toSummaryResponse(Lesson lesson);

    // ADMIN //
    @Mapping(target = "topicName", source = "topic.name")
    @Mapping(target = "levelName", source = "level.name")
    @Mapping(target = "languageName", source = "language.name")
    AdminLessonSummaryResponse toAdminSummaryResponse(Lesson lesson);

    @Mapping(target = "topicName", source = "topic.name")
    @Mapping(target = "levelName", source = "level.name")
    @Mapping(target = "languageName", source = "language.name")
    @Mapping(target = "suggestVocabularies", source = "suggestVocabularies")
    AdminLessonDetailResponse toAdminDetailResponse(Lesson lesson);

    void updateEntityFromRequest(AdminUpdateLessonRequest request, @MappingTarget Lesson lesson);
} 