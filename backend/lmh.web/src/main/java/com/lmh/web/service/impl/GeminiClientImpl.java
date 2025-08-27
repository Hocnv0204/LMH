package com.lmh.web.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lmh.web.common.exception.GeminiException;
import com.lmh.web.common.exception.InvalidDataException;
import com.lmh.web.dto.request.gemini.GeminiRequest;
import com.lmh.web.dto.response.gemini.GeminiResponse;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.model.History;
import com.lmh.web.model.Lesson;
import com.lmh.web.model.User;
import com.lmh.web.repository.HistoryRepository;
import com.lmh.web.service.GeminiClient;
import com.lmh.web.service.lesson.LessonService;
import com.lmh.web.service.user.UserService;
import com.lmh.web.utils.mapper.history.HistoryMapper;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiClientImpl implements GeminiClient {

    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiKey;

    private final ResourceLoader loader;

    public static final String FLOW_PROMPT_PATH = "classpath:prompt/practice_prompt.md";

    private final UserService userService;

    private final LessonService lessonService;

    private final HistoryMapper historyMapper;

    private final HistoryRepository historyRepository;

    @NotNull
    public String getPromptFromPath(String path) throws IOException {
        Resource resource = loader.getResource(path);
        InputStream input = resource.getInputStream();
        byte[] buffer = FileCopyUtils.copyToByteArray(input);
        return new String(buffer, StandardCharsets.UTF_8);
    }

    @Override
    public HistoryResponse getDataFromPrompt(GeminiRequest geminiRequest, String username, Integer lessonId) throws IOException {
        User user = userService.getUserByUsername(username);
        if (user.getCredit()<=0){
            throw new InvalidDataException("Don't enough credit! - " + username);
        }
        Lesson lesson = lessonService.findById(lessonId);
        Map<String, Object> responseGemini = callGemini(geminiRequest);
        if (!(boolean) responseGemini.get("isValid")){
            throw new GeminiException("No generated text");
        }
        History history = new History();
        history.setUser(user);
        history.setLesson(lesson);
        history.setQuestion(geminiRequest.getQuestion());
        history.setAnswer(geminiRequest.getAnswer());
        history.setResult((String) responseGemini.get("response"));
        history.setCreatedAt(LocalDateTime.now());
        return historyMapper.toResponse(historyRepository.save(history));
    }

    private Map<String, Object> callGemini(GeminiRequest geminiRequest) throws IOException {
        String API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=%s";
        String apiUrl = String.format(API_URL_TEMPLATE, geminiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        String requestBody;
        String prompt = getPromptFromPath(FLOW_PROMPT_PATH)
                .replace("{answer}", geminiRequest.getAnswer())
                .replace("{question}", geminiRequest.getQuestion());
        try {
            requestBody = objectMapper.writeValueAsString(makeBodyRequest(objectMapper, prompt));
        } catch (Exception e) {
            throw new RuntimeException("Failed to construct JSON request body", e);
        }

        log.info("Request: {}", requestBody);
        WebClient webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        String response = webClient.post()
                .uri(apiUrl)
                .headers(httpHeaders -> httpHeaders.addAll(headers))
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            Map<String, Object> result = new HashMap<>();
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            result.put("isValid", false);
            if (geminiResponse != null &&
                    !geminiResponse.getCandidates().isEmpty() &&
                    geminiResponse.getCandidates().get(0).getContent() != null &&
                    !geminiResponse.getCandidates().get(0).getContent().getParts().isEmpty()) {

                String text = geminiResponse.getCandidates().get(0).getContent().getParts().get(0).getText();
                log.info(text);
                result.put("isValid", true);
                try {
                    ObjectNode jsonNode = (ObjectNode) objectMapper.readTree(text);
                    if (jsonNode.has("response")) {
                        result.put("response", jsonNode.get("response").asText());
                        return result;
                    }
                } catch (Exception e) {
                    result.put("response", text);
                    return result;
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to parse Gemini response", e);
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    private ObjectNode makeBodyRequest(ObjectMapper objectMapper, String prompt) {
        ObjectNode contentNode = objectMapper.createObjectNode();
        ObjectNode partsNode = objectMapper.createObjectNode();
        partsNode.put("text", prompt);
        contentNode.set("parts", objectMapper.createArrayNode().add(partsNode));
        ObjectNode requestBodyNode = objectMapper.createObjectNode();
        requestBodyNode.set("contents", objectMapper.createArrayNode().add(contentNode));
        return requestBodyNode;
    }

}