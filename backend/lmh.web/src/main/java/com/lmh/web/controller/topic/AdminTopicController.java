//package com.lmh.web.controller.topic;
//
//import com.lmh.web.common.TypeTopic;
//import com.lmh.web.dto.request.topic.CreateTopicRequest;
//import com.lmh.web.dto.response.topic.TopicDto;
//import com.lmh.web.dto.request.topic.UpdateTopicRequest;
//import com.lmh.web.service.topic.TopicService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.data.web.PageableDefault;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.io.IOException;
//
///**
// * Admin controller for Topic management
// * Accessible only by users with ADMIN role
// */
//@RestController
//@RequestMapping("/api/admin/topics")
//@RequiredArgsConstructor
//@Slf4j
//@PreAuthorize("hasRole('ADMIN')")
//public class AdminTopicController {
//
//    private final TopicService topicService;
//
//    /**
//     * Get paginated and sorted list of all topics with dynamic search
//     */
//    @GetMapping
//    public ResponseEntity<Page<TopicDto>> getAllTopics(
//            @RequestParam(required = false) String search,
//            @RequestParam(required = false) String name,
//            @RequestParam(required = false) String languageName,
//            @RequestParam(required = false) TypeTopic type,
//            @RequestParam(required = false) Boolean deleteFlag,
//            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
//
//        log.info("Admin getting all topics with filters");
//        Page<TopicDto> topics = topicService.getTopicsForAdmin(search, name, languageName, type, deleteFlag, pageable);
//        return ResponseEntity.ok(topics);
//    }
//
//    /**
//     * Get topic by ID
//     */
//    @GetMapping("/{id}")
//    public ResponseEntity<TopicDto> getTopicById(@PathVariable Integer id) {
//        log.info("Admin getting topic by id: {}", id);
//        TopicDto topic = topicService.getTopicByIdForAdmin(id);
//        return ResponseEntity.ok(topic);
//    }
//
//    /**
//     * Create new topic
//     */
//    @PostMapping
//    public ResponseEntity<TopicDto> createTopic(@Valid @ModelAttribute CreateTopicRequest request) throws IOException {
//        log.info("Admin creating new topic: {}", request.getName());
//        TopicDto createdTopic = topicService.createTopicForAdmin(request);
//        return ResponseEntity.status(HttpStatus.CREATED).body(createdTopic);
//    }
//
//    /**
//     * Update topic by ID
//     */
//    @PutMapping("/{id}")
//    public ResponseEntity<TopicDto> updateTopic(@PathVariable Integer id,
//                                                @Valid @ModelAttribute UpdateTopicRequest request) throws IOException {
//        log.info("Admin updating topic: {}", id);
//        TopicDto updatedTopic = topicService.updateTopicForAdmin(id, request);
//        return ResponseEntity.ok(updatedTopic);
//    }
//
//    /**
//     * Soft delete topic by ID
//     */
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteTopic(@PathVariable Integer id) {
//        log.info("Admin deleting topic: {}", id);
//        topicService.deleteTopicForAdmin(id);
//        return ResponseEntity.noContent().build();
//    }
//}
//
