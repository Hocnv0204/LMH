package com.lmh.web.service.gemini;

import com.lmh.web.common.exception.ApiException;
import com.lmh.web.dto.request.gemini.GeminiApiRequest;
import com.lmh.web.dto.response.gemini.GeminiApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiApiClient {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public String generateContent(String prompt) {
        log.info("Sending request to Gemini API...");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        GeminiApiRequest apiRequest = new GeminiApiRequest(prompt);
        HttpEntity<GeminiApiRequest> entity = new HttpEntity<>(apiRequest, headers);

        String requestUrl = apiUrl + "?key=" + apiKey;

        try {
            GeminiApiResponse response = restTemplate.postForObject(requestUrl, entity, GeminiApiResponse.class);

            if (response == null || response.getFirstCandidateText() == null) {
                log.error("Gemini API returned an empty or invalid response.");
                throw new ApiException("Không nhận được phản hồi hợp lệ từ AI.");
            }

            String rawText = response.getFirstCandidateText();
            log.info("Received raw response from Gemini API.");

            // AI thường trả về JSON trong một khối markdown, cần làm sạch nó.
            return cleanApiResponse(rawText);

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            throw new ApiException("Có lỗi xảy ra khi giao tiếp với AI.", e);
        }
    }

    /**
     * Làm sạch chuỗi JSON trả về từ API, loại bỏ các ký tự markdown.
     * Ví dụ: ```json\n{...}\n``` -> {...}
     * @param rawText Chuỗi thô từ API.
     * @return Chuỗi JSON sạch.
     */
    private String cleanApiResponse(String rawText) {
        String cleanedText = rawText.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.substring(7);
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.substring(3);
        }

        if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.substring(0, cleanedText.length() - 3);
        }

        return cleanedText.trim();
    }
}