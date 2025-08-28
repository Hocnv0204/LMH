package com.lmh.web.service.topic;

import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicRequest;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Topic;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication; // For PreAuthorize check
import org.springframework.web.multipart.MultipartFile;

public interface TopicService {

    Page<TopicResponse> getAllTopicsForUser(
            Integer userId, String searchTerm, String languageName,
            int page, int size, String sortBy, String sortDir
    );

    // New service method for default topics
    Page<TopicResponse> getDefaultTopics(
            String searchTerm, String languageName,
            int page, int size, String sortBy, String sortDir
    );

    // New service method for user-created topics only
    Page<TopicResponse> getUserCreatedTopics(
            Integer userId, String searchTerm, String languageName,
            int page, int size, String sortBy, String sortDir
    );

    TopicResponse createTopicForUser(Integer userId, TopicRequest request, MultipartFile file);

    // userId is no longer needed here as authorization is done at the controller level
    TopicResponse updateTopicForUser(Integer topicId, UpdateTopicRequest request, MultipartFile file);

    // userId is no longer needed here
    void deleteTopicForUser(Integer topicId);

    Topic findByName(String topicName);

    // Method for @PreAuthorize to check topic ownership
    boolean isOwner(Integer topicId, Authentication authentication);
}