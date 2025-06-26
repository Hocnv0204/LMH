package com.lmh.web.utils.mapper.lesson;

import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.model.Lesson;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface LessonMapper {
    LessonResponse toResponse(Lesson lesson);
    Lesson toEntity(LessonRequest request);
    List<LessonResponse> toResponseList(List<Lesson> lessons);
} 