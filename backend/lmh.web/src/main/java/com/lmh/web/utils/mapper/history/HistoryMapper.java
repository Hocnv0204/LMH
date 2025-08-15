package com.lmh.web.utils.mapper.history;
import org.mapstruct.Mapping;
import com.lmh.web.dto.response.history.AdminHistoryResponse;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.model.History;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HistoryMapper {
    @Mapping(target = "lessonId", source = "lesson.id")
    @Mapping(target = "lessonName", source = "lesson.name")
    HistoryResponse toResponse(History history);
    List<HistoryResponse> toResponseList(List<History> historyList);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "lessonId", source = "lesson.id")
    @Mapping(target = "lessonName", source = "lesson.name")
    AdminHistoryResponse toAdminResponse(History history);
}
