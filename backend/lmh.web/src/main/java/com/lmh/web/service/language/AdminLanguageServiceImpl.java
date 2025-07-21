package com.lmh.web.service.language;

import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.language.AdminCreateLanguageRequest;
import com.lmh.web.dto.request.language.AdminUpdateLanguageRequest;
import com.lmh.web.dto.response.language.AdminLanguageResponse;
import com.lmh.web.model.Language;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.utils.mapper.language.LanguageMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminLanguageServiceImpl implements AdminLanguageService {

    private final LanguageRepository languageRepository;
    private final LanguageMapper languageMapper;

    @Override
    public Page<AdminLanguageResponse> getAllLanguagesForAdmin(String searchTerm, Boolean isDeleted, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Language> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (searchTerm != null && !searchTerm.isBlank()) {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern));
            }

            if (isDeleted != null) {
                predicates.add(criteriaBuilder.equal(root.get("deleteFlag"), isDeleted));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Language> languagePage = languageRepository.findAll(spec, pageable);
        return languagePage.map(languageMapper::toAdminResponse);
    }

    @Override
    public AdminLanguageResponse getLanguageByIdForAdmin(Integer languageId) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với ID: " + languageId));
        return languageMapper.toAdminResponse(language);
    }

    @Override
    public AdminLanguageResponse createLanguageForAdmin(AdminCreateLanguageRequest request) {
        if (languageRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DataExistedException("Tên ngôn ngữ đã tồn tại: " + request.getName());
        }

        Language language = languageMapper.toEntity(request);
        language.setDeleteFlag(false);
        language.setCreatedAt(LocalDateTime.now());

        Language savedLanguage = languageRepository.save(language);
        return languageMapper.toAdminResponse(savedLanguage);
    }

    @Override
    public AdminLanguageResponse updateLanguageForAdmin(Integer languageId, AdminUpdateLanguageRequest request) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với ID: " + languageId));

        // Kiểm tra nếu tên mới được cung cấp và nó khác với tên hiện tại
        if (request.getName() != null && !request.getName().equalsIgnoreCase(language.getName())) {
            // Kiểm tra xem tên mới đã tồn tại ở một ngôn ngữ khác chưa
            languageRepository.findByNameIgnoreCase(request.getName()).ifPresent(existingLanguage -> {
                if (!existingLanguage.getId().equals(languageId)) {
                    throw new DataExistedException("Tên ngôn ngữ đã tồn tại: " + request.getName());
                }
            });
        }

        languageMapper.updateEntityFromRequest(request, language);
        language.setUpdatedAt(LocalDateTime.now());

        Language updatedLanguage = languageRepository.save(language);
        return languageMapper.toAdminResponse(updatedLanguage);
    }

    @Override
    public void deleteLanguageForAdmin(Integer languageId) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với ID: " + languageId));

        // Thêm logic kiểm tra xem ngôn ngữ có đang được sử dụng không (ví dụ: có topic nào không)
        // if (language.getTopics() != null && !language.getTopics().isEmpty()) {
        //     throw new DataConstraintException("Không thể xóa ngôn ngữ đang được sử dụng.");
        // }

        language.setDeleteFlag(true);
        language.setUpdatedAt(LocalDateTime.now());
        languageRepository.save(language);
    }

    @Override
    public void restoreLanguageForAdmin(Integer languageId) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với ID: " + languageId));

        language.setDeleteFlag(false);
        language.setUpdatedAt(LocalDateTime.now());
        languageRepository.save(language);
    }
}