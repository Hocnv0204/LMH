package com.lmh.web.service.gemini;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lmh.web.dto.response.gemini.GeminiCreateLessonResponse;
import com.lmh.web.model.Lesson;
import com.lmh.web.model.SuggestVocabulary;
import com.lmh.web.repository.LessonRepository;
import com.lmh.web.repository.SuggestVocabularyRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiLessonGeneratorService {

    private final LessonRepository lessonRepository;
    private final SuggestVocabularyRepository suggestVocabularyRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;
    private final GeminiApiClient geminiApiClient;

    @Async // Đánh dấu phương thức này sẽ chạy trong một luồng riêng
    @Transactional // Đảm bảo tất cả các thao tác DB được thực hiện trong một giao dịch
    public void generateAndSaveLessonContent(Integer lessonId, String topicDescription, String levelName, String description, String languageCode) {
        log.info("Starting lesson generation for lessonId: {}", lessonId);
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            log.error("Placeholder lesson with id {} not found.", lessonId);
            return;
        }

        try {
            // 1. Đọc và chuẩn bị prompt
            String prompt = loadAndFormatPrompt(topicDescription, levelName, description, languageCode);

            // 2. Gọi API Gemini
            String jsonResponse = geminiApiClient.generateContent(prompt);
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
            lessonRepository.save(lesson);
            suggestVocabularyRepository.saveAll(vocabularies);

            log.info("Successfully generated and saved content for lessonId: {}", lessonId);

        } catch (Exception e) {
            log.error("Failed to generate lesson content for lessonId: {}", lessonId, e);
            // Cập nhật trạng thái lỗi cho bài học
            lesson.setStatus("FAILED");
            lessonRepository.save(lesson);
        }
    }

    private String loadAndFormatPrompt(String topic, String level, String description, String languageCode) throws Exception {
        String promptFileName = "prompt/create_lesson_prompt_" + languageCode + ".txt";
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

    // Hàm giả lập phản hồi từ Gemini để test
    private String getMockGeminiResponse() {
        return "{\"lessonTitle\":\"Daily Activities at the Supermarket\",\"lessonDescription\":\"A B1 level lesson focusing on vocabulary and phrases for shopping at a supermarket, including asking for prices and finding items.\",\"vietnameseParagraph\":\"Hôm qua, tôi đã đi siêu thị để mua một vài thứ cần thiết cho tuần tới. Đầu tiên, tôi cần mua một ít rau củ tươi như cà rốt, bông cải xanh và khoai tây. Sau đó, tôi đi đến quầy thịt để chọn một ít ức gà không xương. Nhân viên ở đó rất thân thiện và đã giúp tôi cân đúng số lượng tôi cần. Tiếp theo, tôi tìm mua một hộp sữa tươi và một vài hộp sữa chua. Lối đi giữa các gian hàng khá đông đúc, nhưng tôi vẫn xoay sở để đẩy chiếc xe của mình qua. Cuối cùng, trước khi ra quầy thanh toán, tôi nhớ ra mình cần mua một chai dầu gội đầu. Tôi đã phải xếp hàng một lúc, nhưng quá trình thanh toán diễn ra khá nhanh chóng. Đó là một chuyến đi mua sắm hiệu quả.\",\"suggestVocabularyList\":[{\"term\":\"essential\",\"vi\":\"thiết yếu, cần thiết\",\"type\":\"adjective\",\"pronunciation\":\"/ɪˈsɛnʃəl/\",\"example\":\"Fresh vegetables are essential for a healthy diet.\"},{\"term\":\"produce section\",\"vi\":\"quầy rau củ\",\"type\":\"collocation\",\"pronunciation\":\"/ˈproʊduːs ˈsɛkʃən/\",\"example\":\"You can find carrots and broccoli in the produce section.\"},{\"term\":\"boneless\",\"vi\":\"không xương\",\"type\":\"adjective\",\"pronunciation\":\"/ˈboʊnləs/\",\"example\":\"I prefer to buy boneless chicken breast for quick meals.\"},{\"term\":\"get through\",\"vi\":\"xoay sở, đi qua\",\"type\":\"phrasal verb\",\"pronunciation\":\"/ɡɛt θruː/\",\"example\":\"It was difficult to get through the crowded aisle.\"},{\"term\":\"check-out counter\",\"vi\":\"quầy thanh toán\",\"type\":\"collocation\",\"pronunciation\":\"/ˈʧɛkˌaʊt ˈkaʊntər/\",\"example\":\"Please go to the check-out counter to pay for your items.\"}]}";
    }
}