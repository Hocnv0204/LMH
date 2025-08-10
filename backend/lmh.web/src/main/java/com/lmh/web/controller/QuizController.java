package com.lmh.web.controller;

import com.lmh.web.dto.request.quiz.StartQuizRequest;
import com.lmh.web.dto.request.quiz.AnswerQuizRequest;
import com.lmh.web.dto.response.quiz.QuizQuestionResponse;
import com.lmh.web.dto.response.quiz.QuizSessionResponse;
import com.lmh.web.dto.response.ApiResponse;
import com.lmh.web.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    
    private final QuizService quizService;
    
    @PostMapping("/start/{userId}")
    public ResponseEntity<ApiResponse<?>> startQuiz(
            @Valid @RequestBody StartQuizRequest request,
            @PathVariable Integer userId) {
        
        QuizSessionResponse response = quizService.startQuiz(request, userId);
        
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
    
    @PostMapping("/answer")
    public ResponseEntity<ApiResponse<?>> answerQuestion(
            @Valid @RequestBody AnswerQuizRequest request,
            @RequestParam String sessionId,
            @RequestHeader("User-Id") Integer userId) {
        
        QuizQuestionResponse response = quizService.answerQuestion(request, sessionId, userId);
        
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
    
    @GetMapping("/question")
    public ResponseEntity<ApiResponse<?>> getCurrentQuestion(
            @RequestParam String sessionId,
            @RequestHeader("User-Id") Integer userId) {
        
        QuizQuestionResponse response = quizService.getCurrentQuestion(sessionId, userId);
        
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
    
    @PostMapping("/end")
    public ResponseEntity<ApiResponse<?>> endQuiz(
            @RequestParam String sessionId,
            @RequestHeader("User-Id") Integer userId) {
        
        quizService.endQuiz(sessionId, userId);
        
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data("Quiz đã kết thúc thành công")
                        .build()
        );
    }
}
