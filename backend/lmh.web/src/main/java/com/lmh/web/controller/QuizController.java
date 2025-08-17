package com.lmh.web.controller;

import com.lmh.web.dto.request.quiz.StartQuizRequest;
import com.lmh.web.dto.request.quiz.AnswerRequest;
import com.lmh.web.dto.response.quiz.QuizQuestionResponse;
import com.lmh.web.dto.response.quiz.QuizSessionResponse;
import com.lmh.web.dto.response.quiz.AnswerResponse;
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
    
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<?>> startQuiz(
            @Valid @RequestBody StartQuizRequest request,
            @RequestParam Integer userId) {

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
            @Valid @RequestBody AnswerRequest request,
            @RequestParam Integer userId) {

        AnswerResponse response = quizService.answerQuestion(request, userId);

        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
    
    @GetMapping("/question")
    public ResponseEntity<ApiResponse<?>> getCurrentQuestion(
            @RequestParam String quizId,
            @RequestParam Integer userId) {

        QuizQuestionResponse response = quizService.getCurrentQuestion(quizId, userId);

        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
    
    @PostMapping("/finish")
    public ResponseEntity<ApiResponse<?>> finishQuiz(
            @RequestParam String quizId,
            @RequestParam Integer userId) {

        quizService.finishQuiz(quizId, userId);

        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data("Quiz đã kết thúc thành công")
                        .build()
        );
    }
}
