package com.lmh.web.service.level;

import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.level.AdminCreateLevelRequest;
import com.lmh.web.dto.request.level.AdminUpdateLevelRequest;
import com.lmh.web.dto.response.level.AdminLevelResponse;
import com.lmh.web.model.Language;
import com.lmh.web.model.Level;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.repository.LevelRepository;
import com.lmh.web.utils.mapper.level.LevelMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminLevelServiceImpl implements AdminLevelService {

    private final LevelRepository levelRepository;
    private final LanguageRepository languageRepository; // Inject LanguageRepository
    private final LevelMapper levelMapper;

    @Override
    public Page<AdminLevelResponse> getAllLevelsForAdmin(String searchTerm, Integer languageId, Boolean isDeleted, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Level> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(searchTerm)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + searchTerm.toLowerCase() + "%"));
            }

            if (languageId != null) {
                predicates.add(cb.equal(root.get("language").get("id"), languageId));
            }

            // Điều kiện ĐỘNG: Lọc theo trạng thái xóa
            if (isDeleted != null) {

                predicates.add(cb.equal(root.get("deleteFlag"), isDeleted));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Level> levelPage = levelRepository.findAll(spec, pageable);
        return levelPage.map(levelMapper::toAdminResponse);
    }

    @Override
    public AdminLevelResponse getLevelByIdForAdmin(Integer levelId) {
        Level level = levelRepository.findById(levelId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy trình độ với ID: " + levelId));
        return levelMapper.toAdminResponse(level);
    }

    @Override
    public AdminLevelResponse createLevelForAdmin(AdminCreateLevelRequest request) {
        // === LOGIC QUAN TRỌNG: GẮN LEVEL VỚI LANGUAGE ===
        // 1. Kiểm tra Language có tồn tại không.
        Language language = languageRepository.findById(request.getLanguageId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với ID: " + request.getLanguageId()));

        // 2. Kiểm tra tên Level đã tồn tại trong Language đó chưa.
        if (levelRepository.existsByNameIgnoreCaseAndLanguageId(request.getName(), request.getLanguageId())) {
            throw new DataExistedException("Trình độ '" + request.getName() + "' đã tồn tại cho ngôn ngữ '" + language.getName() + "'");
        }

        Level level = levelMapper.toEntity(request);
        level.setLanguage(language); // 3. Gán Language vào Level
        level.setDeleteFlag(false);
        level.setCreatedAt(LocalDateTime.now());

        Level savedLevel = levelRepository.save(level);
        return levelMapper.toAdminResponse(savedLevel);
    }

    @Override
    public AdminLevelResponse updateLevelForAdmin(Integer levelId, AdminUpdateLevelRequest request) {
        Level level = levelRepository.findById(levelId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy trình độ với ID: " + levelId));

        // Nếu có cập nhật tên, kiểm tra trùng lặp
        if (StringUtils.hasText(request.getName()) && !request.getName().equalsIgnoreCase(level.getName())) {
            Integer langId = (request.getLanguageId() != null) ? request.getLanguageId() : level.getLanguage().getId();
            levelRepository.findByNameIgnoreCaseAndLanguageId(request.getName(), langId).ifPresent(existing -> {
                if(!existing.getId().equals(levelId)) {
                    throw new DataExistedException("Tên trình độ đã tồn tại trong ngôn ngữ này.");
                }
            });
        }

        // Nếu có cập nhật languageId, tìm và gán language mới
        if(request.getLanguageId() != null && !request.getLanguageId().equals(level.getLanguage().getId())) {
            Language newLanguage = languageRepository.findById(request.getLanguageId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với ID: " + request.getLanguageId()));
            level.setLanguage(newLanguage);
        }

        levelMapper.updateEntityFromRequest(request, level);
        level.setUpdatedAt(LocalDateTime.now());

        Level updatedLevel = levelRepository.save(level);
        return levelMapper.toAdminResponse(updatedLevel);
    }

    @Override
    public void deleteLevelForAdmin(Integer levelId) {
        Level level = levelRepository.findById(levelId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy trình độ với ID: " + levelId));

        level.setDeleteFlag(true);
        level.setUpdatedAt(LocalDateTime.now());
        levelRepository.save(level);
    }

    @Override
    public void restoreLevelForAdmin(Integer levelId) {
        Level level = levelRepository.findById(levelId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy trình độ với ID: " + levelId));

        // Đơn giản là đặt cờ xóa về false
        level.setDeleteFlag(false);
        level.setUpdatedAt(LocalDateTime.now());
        levelRepository.save(level);
    }
}