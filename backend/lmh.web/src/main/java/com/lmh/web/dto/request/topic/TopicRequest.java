package com.lmh.web.dto.request.topic;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lmh.web.dto.request.language.LanguageRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TopicRequest {
    private String name;
    private String description;
    private LanguageRequest languageRequest;
}