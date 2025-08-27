package com.lmh.web.dto.request.topic;

// import com.lmh.web.dto.request.level.LevelRequest; // Bỏ đi
import com.lmh.web.dto.request.language.LanguageRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTopicRequest {
    private String name;
    private String description;
    private LanguageRequest languageRequest; // Thêm vào để có thể cập nhật ngôn ngữ
}