package com.lmh.web.dto.request.level;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateLevelRequest {

    private String name;
    private String description;
    private Integer languageId; // Cho phép thay đổi ngôn ngữ của Level
}