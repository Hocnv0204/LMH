package com.lmh.web.dto.response.suggest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SuggestVocabularyResponse {
    private int id;
    private String term;
    private String vietnamese;
    private String type;
    private String pronunciation;
    private String example;
} 