package com.lmh.web.utils.mapper.level;

import com.lmh.web.dto.request.level.AdminCreateLevelRequest;
import com.lmh.web.dto.request.level.AdminUpdateLevelRequest;
import com.lmh.web.dto.response.level.AdminLevelResponse;
import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Level;
import com.lmh.web.model.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LevelMapper {
    List<LevelResponse> toResponseList(List<Level> levels);

    /**
     * Chuyển đổi từ Level Entity sang AdminLevelResponse DTO.
     */
    @Mapping(target = "languageName", source = "language.name")
    AdminLevelResponse toAdminResponse(Level level);

    /**
     * Chuyển đổi từ AdminCreateLevelRequest DTO sang Level Entity.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleteFlag", ignore = true)
    @Mapping(target = "language", ignore = true) // Sẽ được xử lý ở Service
    Level toEntity(AdminCreateLevelRequest request);

    /**
     * Cập nhật thông tin từ AdminUpdateLevelRequest DTO vào Level Entity đã có.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleteFlag", ignore = true)
    @Mapping(target = "language", ignore = true)
    void updateEntityFromRequest(AdminUpdateLevelRequest request, @MappingTarget Level level);
}
