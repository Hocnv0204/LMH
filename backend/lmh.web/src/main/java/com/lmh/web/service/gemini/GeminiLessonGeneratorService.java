package com.lmh.web.service.gemini;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lmh.web.dto.response.gemini.GeminiCreateLessonResponse;
import com.lmh.web.model.Lesson;
import com.lmh.web.model.SuggestVocabulary;
import com.lmh.web.model.User;
import com.lmh.web.repository.LessonRepository;
import com.lmh.web.repository.SuggestVocabularyRepository;
import com.lmh.web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import com.lmh.web.event.lesson.LessonGenerationCompletionEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.lmh.web.common.exception.GeminiApiException;
import com.lmh.web.event.lesson.LessonGenerationCompletionEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiLessonGeneratorService {

    private final LessonRepository lessonRepository;
    private final SuggestVocabularyRepository suggestVocabularyRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;
    private final GeminiApiClient geminiApiClient;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Async // Đánh dấu phương thức này sẽ chạy trong một luồng riêng
    @Transactional // Đảm bảo tất cả các thao tác DB được thực hiện trong một giao dịch
    public void generateAndSaveLessonContent(Integer lessonId, Integer userId, String topicDescription,
                                             String levelName, String description, String languageCode)
    {
        log.info("Starting lesson generation for lessonId: {}", lessonId);

        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            log.error("Placeholder lesson with id {} not found.", lessonId);
            eventPublisher.publishEvent(new LessonGenerationCompletionEvent(this, userId, lessonId, null, false, "Không tìm thấy bài học placeholder để xử lý."));
            return;
        }

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy user với ID: " + userId));

            String userApiKey = user.getApiKey(); // Giả sử User entity có trường `geminiApiKey`
            String userApiUrl = user.getApiUrl();
            if (userApiKey == null || userApiKey.isBlank() || userApiUrl == null || userApiUrl.isBlank()) {
                throw new IllegalStateException("User " + userId + " không có API key/url được cấu hình.");
            }

            // 1. Đọc và chuẩn bị prompt
            String prompt = loadAndFormatPrompt(topicDescription, levelName, description, languageCode);

            // 2. Gọi API Gemini
            String jsonResponse = geminiApiClient.generateContent(prompt, userApiUrl, userApiKey);
            // String jsonResponse = getMockGeminiResponse(); // Sử dụng mock data để test

            // 3. Parse JSON response
            GeminiCreateLessonResponse aiResponse = objectMapper.readValue(jsonResponse, GeminiCreateLessonResponse.class);

            // 4. Cập nhật Lesson với dữ liệu từ AI
            lesson.setName(aiResponse.getLessonTitle());
            lesson.setDescription(aiResponse.getLessonDescription());
            lesson.setParagraph(aiResponse.getVietnameseParagraph());
            lesson.setStatus("COMPLETED"); // Cập nhật trạng thái

            // 5. Tạo danh sách từ vựng gợi ý
            List<SuggestVocabulary> vocabularies = aiResponse.getSuggestVocabularyList().stream()
                    .map(v -> {
                        SuggestVocabulary suggest = new SuggestVocabulary();
                        suggest.setTerm(v.getTerm());
                        suggest.setVietnamese(v.getVietnamese());
                        suggest.setType(v.getType());
                        suggest.setPronunciation(v.getPronunciation());
                        suggest.setExample(v.getExample());
                        suggest.setLesson(lesson); // Liên kết với bài học
                        return suggest;
                    }).collect(Collectors.toList());

            // 6. Lưu vào DB
            Lesson savedLesson = lessonRepository.save(lesson);
            suggestVocabularyRepository.saveAll(vocabularies);

            log.info("Successfully generated content for lessonId: {}", lessonId);

            eventPublisher.publishEvent(new LessonGenerationCompletionEvent(
                    this,
                    userId,
                    savedLesson.getId(),
                    savedLesson.getName(),
                    true,
                    "Tạo bài học thành công!"
            ));
        } catch (GeminiApiException e) {
            log.error("Gemini API error for lessonId {}: {}", lessonId, e.getApiErrorMessage(), e);
            handleGenerationFailure(lesson, userId, formatGeminiError(e));
        } catch (Exception e) {
            log.error("Failed to generate lesson content for lessonId: {}", lessonId, e);
            handleGenerationFailure(lesson, userId, "Một lỗi không xác định đã xảy ra trong quá trình tạo bài học.");
        }
    }

    private String loadAndFormatPrompt(String topic, String level, String description, String languageCode) throws Exception {
        String promptFileName = "prompt/create_lesson_prompt_" + languageCode.trim() + ".txt";
        log.info("Loading prompt from: {}", promptFileName);

        Resource resource = resourceLoader.getResource("classpath:" + promptFileName);
        if (!resource.exists()) {
            log.error("Prompt file not found for language code: {}", languageCode);
            // Có thể fallback về prompt tiếng Anh mặc định hoặc ném lỗi
            throw new java.io.FileNotFoundException("Không tìm thấy file prompt cho ngôn ngữ: " + languageCode);
        }

        try (InputStream inputStream = resource.getInputStream()) {
            String template = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            return template
                    .replace("{topic}", topic)
                    .replace("{level}", level)
                    .replace("{description}", description);
        }
    }

    /**
     * Xử lý khi quá trình tạo bài học thất bại và bắn sự kiện thông báo.
     */
    private void handleGenerationFailure(Lesson lesson, Integer userId, String errorMessage) {
        if (lesson != null && lessonRepository.existsById(lesson.getId())) {
            lessonRepository.delete(lesson);
        }
        eventPublisher.publishEvent(new LessonGenerationCompletionEvent(
                this,
                userId,
                lesson != null ? lesson.getId() : -1, // Dùng -1 nếu lesson không tồn tại
                null,
                false,
                errorMessage
        ));
    }

    /**
     * Chuyển đổi lỗi từ GeminiApiException thành một thông điệp thân thiện hơn cho người dùng.
     */
    private String formatGeminiError(GeminiApiException e) {
        String baseMessage = "Lỗi từ AI: ";
        if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
            if (e.getApiErrorMessage().toLowerCase().contains("api key not valid")) {
                return baseMessage + "API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình.";
            }
            return baseMessage + "Yêu cầu không hợp lệ. " + e.getApiErrorMessage();
        }
        if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) { // 429
            return baseMessage + "Vượt quá giới hạn yêu cầu (Too Many Requests). Vui lòng thử lại sau.";
        }
        return baseMessage + e.getApiErrorMessage();
    }
}