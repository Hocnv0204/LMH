package com.lmh.web.service.topic;

import com.lmh.web.common.TypeTopic;
import com.lmh.web.dto.*;
import com.lmh.web.common.exception.EntityNotFoundException;
import com.lmh.web.common.exception.UnauthorizedException;
import com.lmh.web.dto.request.topic.CreateTopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicRequest;
import com.lmh.web.dto.response.language.LanguageDto;
import com.lmh.web.dto.response.topic.TopicDto;
import com.lmh.web.dto.response.user.UserDto;
import com.lmh.web.model.Language;
import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.repository.TopicRepository;
import com.lmh.web.service.cloudinary.CloudinaryService;
import com.lmh.web.specification.TopicSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Service layer for Topic management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TopicService {

    private final TopicRepository topicRepository;
    private final LanguageRepository languageRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Get paginated topics for admin with dynamic search and sorting
     */
    @Transactional(readOnly = true)
    public Page<TopicDto> getTopicsForAdmin(String search, String name, String languageName,
                                            TypeTopic type, Boolean deleteFlag, Pageable pageable) {
        log.info("Getting topics for admin with filters - search: {}, name: {}, languageName: {}, type: {}, deleteFlag: {}",
                search, name, languageName, type, deleteFlag);

        Specification<Topic> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(TopicSpecification.hasSearchTerm(search));
        }
        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and(TopicSpecification.hasName(name));
        }
        if (languageName != null && !languageName.trim().isEmpty()) {
            spec = spec.and(TopicSpecification.hasLanguageName(languageName));
        }
        if (type != null) {
            spec = spec.and(TopicSpecification.hasType(type));
        }
        if (deleteFlag != null) {
            spec = spec.and(TopicSpecification.hasDeleteFlag(deleteFlag));
        }

        Page<Topic> topics = topicRepository.findAll(spec, pageable);
        return topics.map(this::convertToDto);
    }

    /**
     * Get paginated topics for regular user with dynamic search and sorting
     */
    @Transactional(readOnly = true)
    public Page<TopicDto> getTopicsForUser(Integer userId, String search, String name,
                                           String languageName, TypeTopic type, Boolean deleteFlag,
                                           Pageable pageable) {
        log.info("Getting topics for user {} with filters", userId);

        Specification<Topic> spec = Specification.allOf(
                TopicSpecification.notDeleted(),
                TopicSpecification.accessibleByUser(userId)
        );

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(TopicSpecification.hasSearchTerm(search));
        }
        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and(TopicSpecification.hasName(name));
        }
        if (languageName != null && !languageName.trim().isEmpty()) {
            spec = spec.and(TopicSpecification.hasLanguageName(languageName));
        }
        if (type != null) {
            spec = spec.and(TopicSpecification.hasType(type));
        }
        if (deleteFlag != null) {
            spec = spec.and(TopicSpecification.hasDeleteFlag(deleteFlag));
        }

        Page<Topic> topics = topicRepository.findAll(spec, pageable);
        return topics.map(this::convertToDto);
    }

    /**
     * Get topic by ID for admin
     */
    @Transactional(readOnly = true)
    public TopicDto getTopicByIdForAdmin(Integer id) {
        log.info("Getting topic {} for admin", id);
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + id));
        return convertToDto(topic);
    }

    /**
     * Get topic by ID for regular user
     */
    @Transactional(readOnly = true)
    public TopicDto getTopicByIdForUser(Integer id, Integer userId) {
        log.info("Getting topic {} for user {}", id, userId);
        Topic topic = topicRepository.findByIdForUser(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found or access denied"));
        return convertToDto(topic);
    }

    /**
     * Create topic for admin
     */
    public TopicDto createTopicForAdmin(CreateTopicRequest request) throws IOException {
        log.info("Creating topic for admin: {}", request.getName());

        Language language = languageRepository.findById(request.getLanguageId())
                .orElseThrow(() -> new EntityNotFoundException("Language not found"));

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        topic.setLanguage(language);
        topic.setType(request.getType() != null ? request.getType() : TypeTopic.DEFAULT);
        topic.setNote(request.getNote());
        topic.setDeleteFlag(false);
        topic.setCreatedAt(LocalDateTime.now());

        // Handle image upload
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadImage(request.getImage());
            topic.setImageUrl(uploadResult.get("secure_url"));
            topic.setImageId(uploadResult.get("public_id"));
        }

        Topic savedTopic = topicRepository.save(topic);
        log.info("Topic created successfully with id: {}", savedTopic.getId());
        return convertToDto(savedTopic);
    }

    /**
     * Create topic for regular user
     */
    public TopicDto createTopicForUser(CreateTopicRequest request, User user) throws IOException {
        log.info("Creating topic for user {}: {}", user.getId(), request.getName());

        Language language = languageRepository.findById(request.getLanguageId())
                .orElseThrow(() -> new EntityNotFoundException("Language not found"));

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        topic.setLanguage(language);
        topic.setUser(user);
        topic.setType(TypeTopic.USER_CREATION); // Automatically set for user creation
        topic.setDeleteFlag(false);
        topic.setCreatedAt(LocalDateTime.now());

        // Handle image upload
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadImage(request.getImage());
            topic.setImageUrl(uploadResult.get("secure_url"));
            topic.setImageId(uploadResult.get("public_id"));
        }

        Topic savedTopic = topicRepository.save(topic);
        log.info("Topic created successfully with id: {}", savedTopic.getId());
        return convertToDto(savedTopic);
    }

    /**
     * Update topic for admin
     */
    public TopicDto updateTopicForAdmin(Integer id, UpdateTopicRequest request) throws IOException {
        log.info("Updating topic {} for admin", id);

        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found"));

        updateTopicFields(topic, request);
        Topic savedTopic = topicRepository.save(topic);
        return convertToDto(savedTopic);
    }

    /**
     * Update topic for regular user
     */
    public TopicDto updateTopicForUser(Integer id, UpdateTopicRequest request, Integer userId) throws IOException {
        log.info("Updating topic {} for user {}", id, userId);

        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found"));

        // Check if user owns the topic
        if (topic.getUser() == null || !topic.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only update topics you own");
        }

        updateTopicFields(topic, request);
        Topic savedTopic = topicRepository.save(topic);
        return convertToDto(savedTopic);
    }

    /**
     * Soft delete topic for admin
     */
    public void deleteTopicForAdmin(Integer id) {
        log.info("Soft deleting topic {} for admin", id);

        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found"));

        topic.setDeleteFlag(true);
        topicRepository.save(topic);
        log.info("Topic {} soft deleted successfully", id);
    }

    /**
     * Soft delete topic for regular user
     */
    public void deleteTopicForUser(Integer id, Integer userId) {
        log.info("Soft deleting topic {} for user {}", id, userId);

        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found"));

        // Check if user owns the topic
        if (topic.getUser() == null || !topic.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete topics you own");
        }

        topic.setDeleteFlag(true);
        topicRepository.save(topic);
        log.info("Topic {} soft deleted successfully", id);
    }

    /**
     * Helper method to update topic fields
     */
    private void updateTopicFields(Topic topic, UpdateTopicRequest request) throws IOException {
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            topic.setName(request.getName());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
            topic.setDescription(request.getDescription());
        }
        if (request.getLanguageId() != null) {
            Language language = languageRepository.findById(request.getLanguageId())
                    .orElseThrow(() -> new EntityNotFoundException("Language not found"));
            topic.setLanguage(language);
        }

        // Handle image update
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            // Delete old image if exists
            if (topic.getImageId() != null) {
                try {
                    cloudinaryService.deleteImage(topic.getImageId());
                } catch (IOException e) {
                    log.warn("Failed to delete old image: {}", e.getMessage());
                }
            }

            // Upload new image
            Map<String, String> uploadResult = cloudinaryService.uploadImage(request.getImage());
            topic.setImageUrl(uploadResult.get("secure_url"));
            topic.setImageId(uploadResult.get("public_id"));
        }
    }

    /**
     * Convert Topic entity to TopicDto
     */
    private TopicDto convertToDto(Topic topic) {
        TopicDto dto = new TopicDto();

        dto.setId(topic.getId());
        dto.setName(topic.getName());
        dto.setDescription(topic.getDescription());
        dto.setDeleteFlag(topic.getDeleteFlag());
        dto.setType(topic.getType());
        dto.setNote(topic.getNote());
        dto.setCreatedAt(topic.getCreatedAt());
        dto.setImageUrl(topic.getImageUrl());
        dto.setImageId(topic.getImageId());

        // Set lesson count
        dto.setLessonCount(topic.getLessons() != null ? (long) topic.getLessons().size() : 0L);

        return dto;
    }
}

