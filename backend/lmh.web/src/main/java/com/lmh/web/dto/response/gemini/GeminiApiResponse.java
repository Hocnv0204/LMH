package com.lmh.web.dto.response.gemini;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

// Lớp này đại diện cho cấu trúc JSON nhận về từ Gemini
@Getter
@Setter
public class GeminiApiResponse {
    private List<Candidate> candidates;

    @Getter
    @Setter
    public static class Candidate {
        private Content content;
    }

    @Getter
    @Setter
    public static class Content {
        private List<Part> parts;
        private String role;
    }

    @Getter
    @Setter
    public static class Part {
        private String text;
    }

    // Phương thức tiện ích để lấy text trả về một cách an toàn
    public String getFirstCandidateText() {
        if (candidates != null && !candidates.isEmpty()) {
            Candidate firstCandidate = candidates.get(0);
            if (firstCandidate != null && firstCandidate.getContent() != null) {
                Content content = firstCandidate.getContent();
                if (content.getParts() != null && !content.getParts().isEmpty()) {
                    Part firstPart = content.getParts().get(0);
                    if (firstPart != null) {
                        return firstPart.getText();
                    }
                }
            }
        }
        return null;
    }
}