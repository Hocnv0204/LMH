package com.lmh.web.utils.mapper.history;

import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.model.History;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HistoryMapper {
    HistoryResponse toResponse(History history);
    List<HistoryResponse> toResponseList(List<History> historyList);
}
