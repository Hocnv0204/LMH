package com.lmh.web.controller.topic;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.service.topic.TopicService;
import com.lmh.web.model.User; // Assuming you have a User principal object
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.lmh.web.utils.AuthUtils;

@RequiredArgsConstructor
@RestController
@RequestMapping("/user/topics")
@Validated
public class TopicController {

    private final TopicService topicService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public CustomResponse<Page<TopicResponse>> getTopics(
            Authentication authentication, // Spring sẽ tự inject null nếu chưa login
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String languageName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Page<TopicResponse> topicPage;

        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        if (authentication != null && authentication.isAuthenticated()) {
            // User đã đăng nhập: Lấy cả topic default và topic của user
            Integer userId = AuthUtils.getUserIdAsInteger(authentication);
            topicPage = topicService.getAllTopicsForUser(
                    userId, searchTerm, languageName, page, size, sortBy, sortDir
            );
        } else {
            // User chưa đăng nhập (khách): Chỉ lấy topic default
            topicPage = topicService.getDefaultTopics(
                    searchTerm, languageName, page, size, sortBy, sortDir
            );
        }

        return new CustomResponse<>(topicPage, HttpStatus.OK);
    }

    //Endpoint mới: Chỉ lấy các topic do người dùng đã đăng nhập tạo ra.
    @GetMapping("/my-topics")
    public CustomResponse<Page<TopicResponse>> getMyTopics(
            Authentication authentication,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String languageName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Integer userId = AuthUtils.getUserIdAsInteger(authentication);

        Page<TopicResponse> topicPage = topicService.getUserCreatedTopics(
                userId, searchTerm, languageName, page, size, sortBy, sortDir
        );

        return new CustomResponse<>(topicPage, HttpStatus.OK);
    }

    // Create a new topic for the authenticated user
    @PostMapping
    public CustomResponse<TopicResponse> createTopic(
            Authentication authentication, // Inject principal
            @RequestParam("request") String requestJson,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws JsonProcessingException {
        Integer userId = AuthUtils.getUserIdAsInteger(authentication);

        TopicRequest request = objectMapper.readValue(requestJson, TopicRequest.class);
        TopicResponse newTopic = topicService.createTopicForUser(userId, request, file);
        return new CustomResponse<>(newTopic, HttpStatus.CREATED);
    }

    // Update a topic, checking ownership with @PreAuthorize
    @PutMapping("/{topicId}")
    @PreAuthorize("@topicServiceImpl.isOwner(#topicId, authentication)")
    public CustomResponse<TopicResponse> updateTopic(
            @PathVariable Integer topicId,
            Authentication authentication,
            @RequestParam("request") String requestJson,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws JsonProcessingException {
        UpdateTopicRequest request = objectMapper.readValue(requestJson, UpdateTopicRequest.class);
        TopicResponse updatedTopic = topicService.updateTopicForUser(topicId, request, file);
        return new CustomResponse<>(updatedTopic, HttpStatus.OK);
    }

    // Delete a topic, checking ownership with @PreAuthorize
    @DeleteMapping("/{topicId}")
    @PreAuthorize("@topicServiceImpl.isOwner(#topicId, authentication)")
    public CustomResponse<String> deleteTopic(
            @PathVariable Integer topicId,
            Authentication authentication
    ) {
        topicService.deleteTopicForUser(topicId);
        return new CustomResponse<>("Topic deleted successfully", HttpStatus.OK);
    }
}