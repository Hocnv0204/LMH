package com.lmh.web.dto.request.suggest;

import com.fasterxml.jackson.annotation.JsonInclude;
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
public class SuggestVocabularyRequest {
    private String lessonName;
    private UserRequest userRequest;
} 