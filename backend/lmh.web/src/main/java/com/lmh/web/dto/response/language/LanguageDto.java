package com.lmh.web.dto.response.language;

import lombok.Data;

@Data
public class LanguageDto {
    private Integer id;
    private String name;
    private String code;
    private String description;
}