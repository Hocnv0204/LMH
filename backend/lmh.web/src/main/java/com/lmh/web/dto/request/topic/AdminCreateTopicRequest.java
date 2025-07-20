package com.lmh.web.dto.request.topic;

import com.lmh.web.dto.request.language.LanguageRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCreateTopicRequest {

    @NotBlank(message = "Tên topic không được để trống")
    private String name;

    private String description;

    private String note;

    // Admin có thể cung cấp ảnh ngay khi tạo
    private String imageUrl;
    private String imageId;

    @NotNull(message = "Ngôn ngữ không được để trống")
    private LanguageRequest languageRequest; // Kế thừa cấu trúc đã có
}