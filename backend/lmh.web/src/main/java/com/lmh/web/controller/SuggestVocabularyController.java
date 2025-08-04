package com.lmh.web.controller;

import com.lmh.web.dto.request.suggest.SuggestVocabularyRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.suggest.SuggestVocabularyResponse;
import com.lmh.web.service.SuggestVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RequiredArgsConstructor
@RestController
@Validated
public class SuggestVocabularyController {
    private final SuggestVocabularyService suggestVocabularyService;

    @GetMapping("/user/suggest-vocabulary/{lessonId}")
    public CustomResponse<?> getSuggestVocabulariesByLessonAndUser(@RequestParam(defaultValue = "10") int size,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "id") String sortBy,
                                                                   @PathVariable Integer lessonId){
        Page<SuggestVocabularyResponse> suggestVocabularies = 
                suggestVocabularyService.getSuggestVocabulariesByLessonId(lessonId, size, page, sortBy);
        return new CustomResponse<>(suggestVocabularies, HttpStatus.OK);
    }
}
