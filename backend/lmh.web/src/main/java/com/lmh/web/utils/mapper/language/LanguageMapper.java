package com.lmh.web.utils.mapper.language;

import com.lmh.web.dto.request.language.AdminCreateLanguageRequest;
import com.lmh.web.dto.request.language.AdminUpdateLanguageRequest;
import com.lmh.web.dto.response.language.AdminLanguageResponse;
import com.lmh.web.dto.response.language.AllLanguageResponse;
import com.lmh.web.model.Language;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LanguageMapper {

    /**
     * Chuyển đổi từ Language Entity sang AdminLanguageResponse DTO.
     */
    @Mapping(target = "topicCount", expression = "java(language.getTopics() != null ? (long) language.getTopics().size() : 0L)")
    AdminLanguageResponse toAdminResponse(Language language);

    /**
     * Chuyển đổi từ AdminCreateLanguageRequest DTO sang Language Entity.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleteFlag", ignore = true)
    @Mapping(target = "topics", ignore = true)
    @Mapping(target = "levels", ignore = true)
    Language toEntity(AdminCreateLanguageRequest request);

    /**
     * Cập nhật thông tin từ AdminUpdateLanguageRequest DTO vào Language Entity đã có.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleteFlag", ignore = true)
    @Mapping(target = "topics", ignore = true)
    @Mapping(target = "levels", ignore = true)
    void updateEntityFromRequest(AdminUpdateLanguageRequest request, @MappingTarget Language language);

    List<AllLanguageResponse> toResponseList(List<Language> languages);
}