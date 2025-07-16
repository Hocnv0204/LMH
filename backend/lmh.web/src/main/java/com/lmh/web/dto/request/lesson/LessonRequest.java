package com.lmh.web.dto.request.lesson;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lmh.web.dto.request.language.LanguageRequest;
import com.lmh.web.dto.request.level.LevelRequest;
import com.lmh.web.dto.request.user.UserRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LessonRequest {
    private String name;
    private String paragraph;
    private String note;
    private String description;
    private String topicName;
    private UserRequest userRequest;
    private LanguageRequest languageRequest;
    private LevelRequest levelRequest;
} 