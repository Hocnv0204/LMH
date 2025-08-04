package com.lmh.web.controller;

import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.request.lesson.UpdateLessonUser;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RequiredArgsConstructor
@RestController
@Validated
public class LessonController {
    private final LessonService lessonService;

    @GetMapping("/user/lesson")
    public CustomResponse<?> findLessonsByUserLanguageLevelTopic(@RequestParam(defaultValue = "10") int size,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "id") String sortBy,
                                                                 @RequestParam Integer userId,
                                                                 @RequestParam String levelName,
                                                                 @RequestParam String languageName,
                                                                 @RequestParam String topicName){
        Page<LessonResponse> lessons = lessonService.getLessonByUserLanguageLevelTopic(userId,
                levelName, languageName, topicName, size, page, sortBy);
        return new CustomResponse<>(lessons, HttpStatus.OK);
    }

    @GetMapping("/user/lesson/{lessonId}")
    public CustomResponse<?> getLesson(@PathVariable Integer lessonId){
        LessonResponse lesson = lessonService.findById(lessonId);
        return new CustomResponse<>(lesson, HttpStatus.OK);
    }

    @PostMapping("/user/lesson/{username}/add-lesson")
    public CustomResponse<?> addLesson(
            @PathVariable String username,
            @RequestBody LessonRequest lessonRequest
    ){
        return new CustomResponse<>(lessonService.addLessonUser(username, lessonRequest), HttpStatus.OK);
    }

    @DeleteMapping("/user/lesson/{username}/delete-lesson")
    public CustomResponse<?> deleteLesson(
            @PathVariable String username,
            @RequestParam String lessonName
    ){
        lessonService.deleteLessonUser(username, lessonName);
        return new CustomResponse<>("Delete lesson successfully", HttpStatus.OK);
    }

    @PutMapping("/user/lesson/{username}/update-lesson")
    public CustomResponse<?> updateLesson(
            @PathVariable String username,
            @RequestBody UpdateLessonUser updateLessonUser
            ){
        return new CustomResponse<>(lessonService.updateLessonUser(username, updateLessonUser));
    }

}
