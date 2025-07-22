package com.lmh.web.dto.request.level;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCreateLevelRequest {

    @NotBlank(message = "Tên trình độ không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Ngôn ngữ không được để trống")
    private Integer languageId; // Bắt buộc phải chọn ngôn ngữ
}