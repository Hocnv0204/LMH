package com.lmh.web.service.topic;

import com.lmh.web.common.constant.TypeTopic;
import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.ForbiddenException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicRequest;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Language;
import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.repository.TopicRepository;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.service.cloudinary.CloudinaryService;
import com.lmh.web.utils.AuthUtils;
import com.lmh.web.utils.mapper.topic.TopicMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service("topicServiceImpl") // Naming the bean for @PreAuthorize
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;
    private final UserRepository userRepository;
    private final LanguageRepository languageRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public Page<TopicResponse> getAllTopicsForUser(
            Integer userId, String searchTerm, String languageName,
            int page, int size, String sortBy, String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Topic> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Predicate defaultTopics = cb.equal(root.get("type"), TypeTopic.DEFAULT);
            Predicate userTopics = cb.and(
                    cb.equal(root.get("type"), TypeTopic.USER_CREATION),
                    cb.equal(root.get("user").get("id"), userId)
            );
            predicates.add(cb.or(defaultTopics, userTopics));

            predicates.add(cb.equal(root.get("deleteFlag"), false));

            if (searchTerm != null && !searchTerm.isBlank()) {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)
                ));
            }

            if (languageName != null && !languageName.isBlank()) {
                predicates.add(cb.equal(root.join("language").get("name"), languageName));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Topic> topicPage = topicRepository.findAll(spec, pageable);
        return topicPage.map(topicMapper::toResponse);
    }

    @Override
    public Page<TopicResponse> getDefaultTopics(
            String searchTerm, String languageName, int page, int size, String sortBy, String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Topic> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Condition: Only fetch topics where type is DEFAULT
            predicates.add(cb.equal(root.get("type"), TypeTopic.DEFAULT));

            predicates.add(cb.equal(root.get("deleteFlag"), false));

            if (searchTerm != null && !searchTerm.isBlank()) {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)
                ));
            }

            if (languageName != null && !languageName.isBlank()) {
                predicates.add(cb.equal(root.join("language").get("name"), languageName));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Topic> topicPage = topicRepository.findAll(spec, pageable);
        return topicPage.map(topicMapper::toResponse);
    }

    @Override
    public Page<TopicResponse> getUserCreatedTopics(
            Integer userId, String searchTerm, String languageName,
            int page, int size, String sortBy, String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Topic> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Điều kiện: Chỉ lấy các topic có type là USER_CREATION và userId khớp
            predicates.add(cb.equal(root.get("type"), TypeTopic.USER_CREATION));
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (searchTerm != null && !searchTerm.isBlank()) {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)
                ));
            }

            if (languageName != null && !languageName.isBlank()) {
                predicates.add(cb.equal(root.join("language").get("name"), languageName));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Topic> topicPage = topicRepository.findAll(spec, pageable);
        return topicPage.map(topicMapper::toResponse);
    }

    @Override
    public TopicResponse createTopicForUser(Integer userId, TopicRequest request, MultipartFile file) {
        log.info("User '{}' is creating a new topic named '{}'", userId, request.getName());
        if (topicRepository.existsByName(request.getName())) {
            throw new DataExistedException("Topic name already exists: " + request.getName());
        }

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        Language language = languageRepository.findByName(request.getLanguageRequest().getName())
                .orElseThrow(() -> new NotFoundException("Language not found: " + request.getLanguageRequest().getName()));

        Topic topic = topicMapper.toEntity(request);
        topic.setUser(currentUser);
        topic.setLanguage(language);
        topic.setType(TypeTopic.USER_CREATION);
        topic.setCreatedAt(LocalDateTime.now());
        topic.setDeleteFlag(false);

        if (file != null && !file.isEmpty()) {
            try {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
                topic.setImageUrl(uploadResult.get("url"));
                topic.setImageId(uploadResult.get("public_id"));
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed", e);
            }
        }

        Topic savedTopic = topicRepository.save(topic);
        log.info("Successfully created topic with ID: {}", savedTopic.getId());
        return topicMapper.toResponse(savedTopic);
    }

    @Override
    public TopicResponse updateTopicForUser(Integer topicId, UpdateTopicRequest request, MultipartFile file) {
        log.info("Updating topic with ID: {}", topicId);
        // Ownership is already checked by @PreAuthorize, so we just find the topic
        Topic topic = findTopicById(topicId);

        topicMapper.updateEntityFromRequest(request, topic);

        if (request.getLanguageRequest() != null && request.getLanguageRequest().getName() != null) {
            Language newLanguage = languageRepository.findByName(request.getLanguageRequest().getName())
                    .orElseThrow(() -> new NotFoundException("Language not found: " + request.getLanguageRequest().getName()));
            topic.setLanguage(newLanguage);
        }

        if (file != null && !file.isEmpty()) {
            try {
                if (topic.getImageId() != null) {
                    cloudinaryService.deleteFile(topic.getImageId());
                }
                Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
                topic.setImageUrl(uploadResult.get("url"));
                topic.setImageId(uploadResult.get("public_id"));
            } catch (IOException e) {
                throw new RuntimeException("Image update failed", e);
            }
        }

        Topic updatedTopic = topicRepository.save(topic);
        log.info("Successfully updated topic with ID: {}", topicId);
        return topicMapper.toResponse(updatedTopic);
    }

    @Override
    public void deleteTopicForUser(Integer topicId) {
        log.info("Deleting topic with ID: {}", topicId);
        // Ownership already checked. Find the topic to ensure it exists before deleting.
        Topic topic = findTopicById(topicId);

        // Perform a hard delete instead of soft delete
        topicRepository.delete(topic);
        log.info("Successfully deleted topic with ID: {}", topicId);
    }

    // restoreTopicForUser method is removed

    // New public method for the @PreAuthorize annotation to call
    @Override
    public boolean isOwner(Integer topicId, Authentication authentication) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Topic not found with ID: " + topicId));

        // A topic must be user-created to have an owner
        if(topic.getType() != TypeTopic.USER_CREATION || topic.getUser() == null) {
            return false;
        }

        Integer ownerId = topic.getUser().getId();
        Integer currentUserId = AuthUtils.getUserIdAsInteger(authentication);

        return ownerId.equals(currentUserId);
    }

    @Override
    public Topic findByName(String topicName){
        log.debug("Tìm kiếm topic theo tên: {}", topicName);
        Optional<Topic> topicOptional = topicRepository.findByName(topicName);
        if (topicOptional.isEmpty()){
            log.warn("Không tìm thấy topic: {}", topicName);
            throw new NotFoundException("Not found topic - " + topicName);
        }
        log.debug("Tìm thấy topic: {}", topicName);
        return topicOptional.get();
    }

    private Topic findTopicById(Integer topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Topic not found with ID: " + topicId));
    }
}