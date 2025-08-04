package com.lmh.web.controller;

import com.lmh.web.dto.request.gemini.GeminiRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.service.GeminiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user/gemini")
public class GeminiController {
    private final GeminiClient geminiClient;

    @PostMapping("/ask/{username}/{lessonId}")
    public CustomResponse<?> askGemini(@RequestBody GeminiRequest geminiRequest, @PathVariable String username, @PathVariable Integer lessonId) throws IOException {
        HistoryResponse response = geminiClient.getDataFromPrompt(geminiRequest, username, lessonId);
        return new CustomResponse<>(response, HttpStatus.OK);
    }
}
