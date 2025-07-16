package com.lmh.web.controller.topic;

import com.lmh.web.common.TypeTopic;
import com.lmh.web.dto.request.topic.CreateTopicRequest;
import com.lmh.web.dto.response.topic.TopicDto;
import com.lmh.web.dto.request.topic.UpdateTopicRequest;
import com.lmh.web.model.User;
import com.lmh.web.service.topic.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * User controller for Topic management
 * Accessible by authenticated users with USER role
 */
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('USER')")
public class UserTopicController {

    private final TopicService topicService;

    /**
     * Get paginated and sorted list of topics accessible to the user
     */
    @GetMapping
    public ResponseEntity<Page<TopicDto>> getTopics(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String languageName,
            @RequestParam(required = false) TypeTopic type,
            @RequestParam(required = false) Boolean deleteFlag,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {

        log.info("User {} getting topics with filters", currentUser.getId());
        Page<TopicDto> topics = topicService.getTopicsForUser(
                currentUser.getId(), search, name, languageName, type, deleteFlag, pageable);
        return ResponseEntity.ok(topics);
    }

    /**
     * Get topic by ID (only if owned by user or DEFAULT type)
     */
    @GetMapping("/{id}")
    public ResponseEntity<TopicDto> getTopicById(@PathVariable Integer id,
                                                 @AuthenticationPrincipal User currentUser) {
        log.info("User {} getting topic by id: {}", currentUser.getId(), id);
        TopicDto topic = topicService.getTopicByIdForUser(id, currentUser.getId());
        return ResponseEntity.ok(topic);
    }

    /**
     * Create new topic (automatically set type to USER_CREATION)
     */
    @PostMapping
    public ResponseEntity<TopicDto> createTopic(@Valid @ModelAttribute CreateTopicRequest request,
                                                @AuthenticationPrincipal User currentUser) throws IOException {
        log.info("User {} creating new topic: {}", currentUser.getId(), request.getName());
        TopicDto createdTopic = topicService.createTopicForUser(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTopic);
    }

    /**
     * Update topic (only if owned by user)
     */
    @PutMapping("/{id}")
    public ResponseEntity<TopicDto> updateTopic(@PathVariable Integer id,
                                                @Valid @ModelAttribute UpdateTopicRequest request,
                                                @AuthenticationPrincipal User currentUser) throws IOException {
        log.info("User {} updating topic: {}", currentUser.getId(), id);
        TopicDto updatedTopic = topicService.updateTopicForUser(id, request, currentUser.getId());
        return ResponseEntity.ok(updatedTopic);
    }

    /**
     * Soft delete topic (only if owned by user)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Integer id,
                                            @AuthenticationPrincipal User currentUser) {
        log.info("User {} deleting topic: {}", currentUser.getId(), id);
        topicService.deleteTopicForUser(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}

