package com.lmh.web.dto.response.lesson;

import com.lmh.web.common.constant.TypeLesson;
import com.lmh.web.dto.response.suggest.SuggestVocabularyResponse;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class AdminLessonDetailResponse {
    private Integer id;
    private String name;
    private String paragraph;
    private String note;
    private String description;
    private Boolean deleteFlag;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String topicName;
    private String levelName;
    private String languageName;
    private List<SuggestVocabularyResponse> suggestVocabularies;
}