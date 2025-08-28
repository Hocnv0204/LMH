package com.lmh.web.service.lesson;

import com.lmh.web.common.constant.TypeLesson;
import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.ForbiddenException;
import com.lmh.web.common.exception.InvalidDataException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.lesson.AdminCreateLessonRequest;
import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.request.lesson.UpdateLessonUser;
import com.lmh.web.dto.response.lesson.LessonGenerationResponse;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.dto.response.lesson.LessonSummaryResponse;
import com.lmh.web.event.lesson.LessonGenerationRequestedEvent;
import com.lmh.web.model.*;
import com.lmh.web.repository.*;
import com.lmh.web.service.language.LanguageService;
import com.lmh.web.service.level.LevelService;
import com.lmh.web.service.topic.TopicService;
import com.lmh.web.service.user.UserService;
import com.lmh.web.utils.mapper.lesson.LessonMapper;
import com.lmh.web.utils.mapper.suggest.SuggestVocabularyMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service("lessonServiceImpl") // Đặt tên cho bean để @PreAuthorize có thể gọi
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final UserService userService;
    private final TopicService topicService;
    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;
    private final LanguageService languageService;
    private final LevelService levelService;
    private final TopicRepository topicRepository;
    private final LevelRepository levelRepository;
    private final LanguageRepository languageRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public LessonGenerationResponse requestLessonGeneration(Integer userId, AdminCreateLessonRequest request) {
        // 1. Tìm các thực thể liên quan
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy chủ đề với ID: " + request.getTopicId()));
        Level level = levelRepository.findById(request.getLevelId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy trình độ với ID: " + request.getLevelId()));
        Language language = languageRepository.findById(request.getLanguageId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với ID: " + request.getLanguageId()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy user với ID: " + userId));

        // 2. Tạo Lesson placeholder
        Lesson lesson = new Lesson();
        lesson.setName(request.getDraftName()); // Tên tạm thời
        lesson.setTopic(topic);
        lesson.setLevel(level);
        lesson.setLanguage(language);
        lesson.setUser(user);
        lesson.setType(TypeLesson.USER_CREATION);
        lesson.setStatus("GENERATING"); // Trạng thái đang xử lý
        lesson.setCreatedAt(LocalDateTime.now());
        lesson.setDeleteFlag(false);
        Lesson savedLesson = lessonRepository.save(lesson);

        // 3. Bắn ra sự kiện với đầy đủ thông tin cần thiết.
        // Spring sẽ giữ sự kiện này và chỉ gửi nó đến Listener sau khi transaction này commit thành công.
        LessonGenerationRequestedEvent event = new LessonGenerationRequestedEvent(
                this,
                savedLesson.getId(),
                userId,
                topic.getDescription(),
                level.getName(),
                request.getDescription(),
                language.getLanguageCode()
        );
        eventPublisher.publishEvent(event);

        // 4. Trả về phản hồi ngay lập tức
        return new LessonGenerationResponse(
                savedLesson.getId(),
                "ACCEPTED",
                "Yêu cầu tạo bài học đã được chấp nhận và đang được xử lý."
        );
    }

    @Override
    public Page<LessonSummaryResponse> getCreatedLessonsForUser(
            Integer userId, String searchTerm, Integer topicId, Integer levelId, Integer languageId,
            int page, int size, String sortBy, String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Lesson> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // --- Điều kiện chính ---
            // 1. Chỉ lấy lesson do người dùng tạo
            predicates.add(cb.equal(root.get("type"), TypeLesson.USER_CREATION));
            // 2. Phải thuộc về đúng user đang truy vấn
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            // Thêm các bộ lọc chung (search, topic, level, language, deleteFlag)
            addCommonFilters(predicates, cb, root, searchTerm, topicId, levelId, languageId);

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Lesson> lessonPage = lessonRepository.findAll(spec, pageable);
        return lessonPage.map(lessonMapper::toSummaryResponse);
    }

    // MỚI: Logic lấy lesson cho user đã đăng nhập (cả default và của user)
    @Override
    public Page<LessonSummaryResponse> getAllLessonsForUser(
            Integer userId, String searchTerm, Integer topicId, Integer levelId, Integer languageId,
            int page, int size, String sortBy, String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Lesson> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("deleteFlag"), false));

            // Điều kiện: (type = DEFAULT) OR (type = USER_CREATION AND user.id = userId)
            Predicate defaultLessons = cb.equal(root.get("type"), TypeLesson.DEFAULT);
            Predicate userLessons = cb.and(
                    cb.equal(root.get("type"), TypeLesson.USER_CREATION),
                    cb.equal(root.get("user").get("id"), userId)
            );
            predicates.add(cb.or(defaultLessons, userLessons));

            // Các filter khác
            addCommonFilters(predicates, cb, root, searchTerm, topicId, levelId, languageId);

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Lesson> lessonPage = lessonRepository.findAll(spec, pageable);
        return lessonPage.map(lessonMapper::toSummaryResponse);
    }

    // MỚI: Logic chỉ lấy lesson DEFAULT cho khách
    @Override
    public Page<LessonSummaryResponse> getDefaultLessons(
            String searchTerm, Integer topicId, Integer levelId, Integer languageId,
            int page, int size, String sortBy, String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Lesson> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("deleteFlag"), false));

            // Điều kiện: chỉ lấy type = DEFAULT
            predicates.add(cb.equal(root.get("type"), TypeLesson.DEFAULT));

            // Các filter khác
            addCommonFilters(predicates, cb, root, searchTerm, topicId, levelId, languageId);

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Lesson> lessonPage = lessonRepository.findAll(spec, pageable);
        return lessonPage.map(lessonMapper::toSummaryResponse);
    }

    // MỚI: Phương thức helper để tái sử dụng logic filter
    private void addCommonFilters(List<Predicate> predicates, jakarta.persistence.criteria.CriteriaBuilder cb, jakarta.persistence.criteria.Root<Lesson> root,
                                  String searchTerm, Integer topicId, Integer levelId, Integer languageId) {

        predicates.add(cb.equal(root.get("deleteFlag"), false));
        predicates.add(cb.equal(root.join("language").get("id"), languageId));

        if (searchTerm != null && !searchTerm.isBlank()) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            predicates.add(cb.like(cb.lower(root.get("name")), likePattern));
        }
        if (topicId != null) {
            predicates.add(cb.equal(root.join("topic").get("id"), topicId));
        }
        if (levelId != null) {
            predicates.add(cb.equal(root.join("level").get("id"), levelId));
        }
    }

    // MỚI: Logic lấy chi tiết lesson, có kiểm tra quyền xem
    @Override
    public LessonResponse getLessonDetails(Integer lessonId, Integer userId) {
        Lesson lesson = findById(lessonId);

        // Trường hợp 1: Nếu bài học là DEFAULT, bất kỳ ai cũng có thể xem
        if (lesson.getType() == TypeLesson.DEFAULT) {
            return lessonMapper.toResponse(lesson);
        }

        // Trường hợp 2: Nếu là bài học do người dùng tạo (USER_CREATION)
        if (lesson.getType() == TypeLesson.USER_CREATION) {
            // Nếu người dùng đã đăng nhập (userId không null) VÀ là chủ sở hữu của bài học
            if (userId != null && lesson.getUser() != null && lesson.getUser().getId().equals(userId)) {
                return lessonMapper.toResponse(lesson);
            }
        }

        // Nếu không rơi vào các trường hợp được phép ở trên, ném ra lỗi.
        // Lỗi này sẽ xảy ra khi:
        // - Người dùng chưa đăng nhập (userId == null) xem bài USER_CREATION.
        // - Người dùng đã đăng nhập nhưng xem bài USER_CREATION của người khác.
        throw new ForbiddenException("Bạn không có quyền xem bài học này.");
    }

    // THAY ĐỔI: Logic thêm lesson, nhận userId thay vì username
    @Override
    public LessonResponse createLessonForUser(Integer userId, LessonRequest lessonRequest) {
        log.info("Bắt đầu thêm bài học mới: {} cho user ID: {}", lessonRequest.getName(), userId);
        if (lessonRepository.existsByName(lessonRequest.getName())) {
            log.warn("Thêm bài học thất bại: Tên bài học đã tồn tại - {}", lessonRequest.getName());
            throw new DataExistedException("Existed name lesson - " + lessonRequest.getName());
        }

        User user = userService.getUserById(userId);
        Topic topic = topicService.findByName(lessonRequest.getTopicName());
        Language language = languageService.findByName(lessonRequest.getLanguageRequest().getName());
        Level level = levelService.findByName(lessonRequest.getLevelRequest().getName());

        Lesson lesson = lessonMapper.toEntity(lessonRequest);
        lesson.setTopic(topic);
        lesson.setLanguage(language);
        lesson.setLevel(level);
        lesson.setUser(user);
        lesson.setType(TypeLesson.USER_CREATION);
        lesson.setCreatedAt(LocalDateTime.now());
        lesson.setUpdatedAt(LocalDateTime.now());
        lesson.setStatus("ACTIVE");
        lesson.setDeleteFlag(false);

        Lesson savedLesson = lessonRepository.save(lesson);
        log.info("Thêm bài học thành công: {} cho user ID: {}, ID: {}", lessonRequest.getName(), userId, savedLesson.getId());
        return lessonMapper.toResponse(savedLesson);
    }

    // THAY ĐỔI: Logic xóa lesson, dùng lessonId và không cần username
    @Override
    public void deleteLessonForUser(Integer lessonId) {
        log.info("Bắt đầu xóa bài học ID: {}", lessonId);
        Lesson lesson = findById(lessonId);

        // Ownership đã được kiểm tra bằng @PreAuthorize ở controller
        if (lesson.getType().equals(TypeLesson.DEFAULT)) {
            log.warn("Xóa bài học thất bại: Không thể xóa bài học mặc định - ID {}", lessonId);
            throw new InvalidDataException("Cannot delete lesson default");
        }

        lessonRepository.delete(lesson);
        log.info("Xóa bài học ID: {} thành công", lessonId);
    }

    // THAY ĐỔI: Logic cập nhật lesson, dùng lessonId
    @Override
    public LessonResponse updateLessonForUser(Integer lessonId, UpdateLessonUser updateLessonUser) {
        log.info("Bắt đầu cập nhật bài học ID: {}", lessonId);
        Lesson lesson = findById(lessonId);

        // Ownership đã được kiểm tra bằng @PreAuthorize ở controller
        if (lesson.getType().equals(TypeLesson.DEFAULT)){
            log.warn("Cập nhật thất bại: Không thể cập nhật bài học mặc định - ID {}", lessonId);
            throw new InvalidDataException("Cannot update lesson default");
        }

        lesson.setParagraph(updateLessonUser.getParagraph());
        lesson.setNote(updateLessonUser.getNote());
        lesson.setDescription(updateLessonUser.getDescription());
        lesson.setUpdatedAt(LocalDateTime.now());

        if (updateLessonUser.getTopicName() != null) {
            Topic topic = topicService.findByName(updateLessonUser.getTopicName());
            lesson.setTopic(topic);
        }

        Lesson updatedLesson = lessonRepository.save(lesson);
        log.info("Cập nhật bài học thành công ID: {}", lessonId);
        return lessonMapper.toResponse(updatedLesson);
    }

    // MỚI: Phương thức kiểm tra ownership để dùng với @PreAuthorize
    @Override
    public boolean isOwner(Integer lessonId, Authentication authentication) {
        Lesson lesson = findById(lessonId);

        if (lesson.getType() != TypeLesson.USER_CREATION || lesson.getUser() == null) {
            return false;
        }

        Integer ownerId = lesson.getUser().getId();
        Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
        Long userIdLong = jwtPrincipal.getClaim("id");
        Integer currentUserId;
        try {
            currentUserId = Math.toIntExact(userIdLong);
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("User ID from token is too large.", e);
        }

        return ownerId.equals(currentUserId);
    }

    @Override
    public Lesson findById(Integer lessonId){
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Not found lesson with id - " + lessonId));
    }
}