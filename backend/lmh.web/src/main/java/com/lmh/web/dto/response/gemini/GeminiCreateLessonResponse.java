package com.lmh.web.dto.response.gemini;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class GeminiCreateLessonResponse {

    private String lessonTitle;
    private String lessonDescription;
    private String vietnameseParagraph;
    private List<GeminiVocabulary> suggestVocabularyList;

    @Getter
    @Setter
    public static class GeminiVocabulary {
        private String term;
        @JsonProperty("vi") // Ánh xạ key "vi" trong JSON vào trường "vietnamese"
        private String vietnamese;
        private String type;
        private String pronunciation;
        private String example;
    }
}