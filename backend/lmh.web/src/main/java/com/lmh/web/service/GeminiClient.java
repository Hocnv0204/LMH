package com.lmh.web.service;

import com.lmh.web.dto.request.gemini.GeminiRequest;
import com.lmh.web.dto.response.history.HistoryResponse;

import java.io.IOException;

public interface GeminiClient {
    HistoryResponse getDataFromPrompt(GeminiRequest geminiRequest, String username, Integer lessonId) throws IOException;
}