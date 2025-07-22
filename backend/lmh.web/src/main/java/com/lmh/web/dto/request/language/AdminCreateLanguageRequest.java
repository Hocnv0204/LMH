package com.lmh.web.dto.request.language;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCreateLanguageRequest {

    @NotBlank(message = "Tên ngôn ngữ không được để trống")
    private String name;

    @NotBlank(message = "Code không được để trống")
    private String languageCode;

    private String note;
}