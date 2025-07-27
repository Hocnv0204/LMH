package com.lmh.web.dto.request.gemini;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

// Lớp này đại diện cho cấu trúc JSON gửi đến Gemini
@Getter
@Setter
public class GeminiApiRequest {
    private List<Content> contents;

    public GeminiApiRequest(String text) {
        this.contents = Collections.singletonList(new Content(text));
    }

    @Getter
    @Setter
    public static class Content {
        private List<Part> parts;

        public Content(String text) {
            this.parts = Collections.singletonList(new Part(text));
        }
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class Part {
        private String text;
    }
}