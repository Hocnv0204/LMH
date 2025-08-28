package com.lmh.web.service.lesson;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.lesson.AdminCreateLessonRequest;
import com.lmh.web.dto.request.lesson.AdminUpdateLessonRequest;
import com.lmh.web.dto.request.suggest.AdminUpdateSuggestVocabularyRequest;
import com.lmh.web.dto.response.lesson.AdminLessonDetailResponse;
import com.lmh.web.dto.response.lesson.AdminLessonSummaryResponse;
import com.lmh.web.dto.response.lesson.LessonGenerationResponse;
import com.lmh.web.event.lesson.LessonGenerationRequestedEvent;
import com.lmh.web.model.*;
import com.lmh.web.repository.*;
import com.lmh.web.utils.mapper.lesson.LessonMapper;
import com.lmh.web.utils.mapper.suggest.SuggestVocabularyMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.lmh.web.common.constant.TypeLesson;

@Service
@RequiredArgsConstructor
public class AdminLessonServiceImpl implements AdminLessonService {

    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;
    private final LevelRepository levelRepository;
    private final LanguageRepository languageRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final LessonMapper lessonMapper;
    private final SuggestVocabularyRepository suggestVocabularyRepository;
    private final SuggestVocabularyMapper suggestVocabularyMapper;

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

        // 2. Tạo Lesson placeholder
        Lesson lesson = new Lesson();
        lesson.setName(request.getDraftName()); // Tên tạm thời
        lesson.setTopic(topic);
        lesson.setLevel(level);
        lesson.setLanguage(language);
        lesson.setType(TypeLesson.DEFAULT);
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
    @Transactional(readOnly = true)
    public Page<AdminLessonSummaryResponse> getAllLessonsForAdmin(String searchTerm, Integer topicId, Integer levelId, Integer languageId, Boolean isDeleted, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Lesson> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("type"), TypeLesson.DEFAULT));

            if (StringUtils.hasText(searchTerm)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + searchTerm.toLowerCase() + "%"));
            }
            if (topicId != null) {
                predicates.add(cb.equal(root.get("topic").get("id"), topicId));
            }
            if (levelId != null) {
                predicates.add(cb.equal(root.get("level").get("id"), levelId));
            }
            if (languageId != null) {
                predicates.add(cb.equal(root.get("language").get("id"), languageId));
            }
            if (isDeleted != null) {
                predicates.add(cb.equal(root.get("deleteFlag"), isDeleted));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Lesson> lessonPage = lessonRepository.findAll(spec, pageable);
        return lessonPage.map(lessonMapper::toAdminSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminLessonDetailResponse getLessonDetailsForAdmin(Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài học với ID: " + lessonId));
        return lessonMapper.toAdminDetailResponse(lesson);
    }

    @Override
    @Transactional
    public AdminLessonDetailResponse updateLessonForAdmin(Integer lessonId, AdminUpdateLessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài học với ID: " + lessonId));

        lessonMapper.updateEntityFromRequest(request, lesson);
        lesson.setUpdatedAt(LocalDateTime.now());

        Lesson updatedLesson = lessonRepository.save(lesson);
        return lessonMapper.toAdminDetailResponse(updatedLesson);
    }

    @Override
    @Transactional // Rất quan trọng: Đảm bảo toàn bộ thao tác là một giao dịch duy nhất
    public void updateVocabulariesForLesson(Integer lessonId, List<AdminUpdateSuggestVocabularyRequest> vocabularyRequests) {
        // 1. Kiểm tra xem Lesson có tồn tại không
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài học với ID: " + lessonId));

        // 2. Xóa sạch toàn bộ từ vựng cũ của bài học này
        suggestVocabularyRepository.deleteAllByLessonId(lessonId);

        // 3. Nếu danh sách mới không rỗng, thêm chúng vào
        if (vocabularyRequests != null && !vocabularyRequests.isEmpty()) {

            // Chuyển đổi từ List<DTO> sang List<Entity>
            List<SuggestVocabulary> newVocabularies = vocabularyRequests.stream()
                    .map(dto -> {
                        SuggestVocabulary entity = suggestVocabularyMapper.toEntity(dto);
                        entity.setLesson(lesson); // <-- Gán liên kết quan trọng tới bài học cha
                        return entity;
                    }).collect(Collectors.toList());

            // Lưu tất cả các entity mới vào DB trong một thao tác
            suggestVocabularyRepository.saveAll(newVocabularies);
        }
    }

    @Override
    @Transactional
    public void deleteLessonForAdmin(Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài học với ID: " + lessonId));
        lesson.setDeleteFlag(true);
        lesson.setUpdatedAt(LocalDateTime.now());
        lessonRepository.save(lesson);
    }

    @Override
    @Transactional
    public void restoreLessonForAdmin(Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài học với ID: " + lessonId));
        lesson.setDeleteFlag(false);
        lesson.setUpdatedAt(LocalDateTime.now());
        lessonRepository.save(lesson);
    }
}