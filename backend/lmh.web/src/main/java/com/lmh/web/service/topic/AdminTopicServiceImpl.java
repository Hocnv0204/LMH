package com.lmh.web.service.topic;

import com.lmh.web.common.constant.TypeTopic;
import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.InvalidDataException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.topic.AdminCreateTopicRequest;
import com.lmh.web.dto.request.topic.AdminUpdateTopicRequest;
import com.lmh.web.dto.response.topic.AdminTopicResponse;
import com.lmh.web.model.Language;
import com.lmh.web.model.Topic;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.repository.TopicRepository;
import com.lmh.web.service.cloudinary.CloudinaryService;
import com.lmh.web.utils.mapper.topic.TopicMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminTopicServiceImpl implements AdminTopicService {

    private final TopicRepository topicRepository;

    private final TopicMapper topicMapper;

    private final CloudinaryService cloudinaryService;

    private final LanguageRepository languageRepository;

    @Override
    public Page<AdminTopicResponse> getAllTopicsForAdmin(
            String searchTerm, String languageName, Integer languageId, Boolean isDeleted,
            int page, int size, String sortBy, String sortDir) {

        // 1. Tạo Pageable để phân trang và sắp xếp (ĐÃ SỬA LỖI)
        // Xác định hướng sắp xếp, mặc định là DESC nếu sortDir không phải là "asc"
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        // Tạo đối tượng Sort
        Sort sort = Sort.by(direction, sortBy);
        // Tạo đối tượng Pageable
        Pageable pageable = PageRequest.of(page, size, sort);

        // 2. Tạo Specification để lọc động
        Specification<Topic> spec = (root, query, criteriaBuilder) -> {
            // Danh sách các điều kiện lọc
            List<Predicate> predicates = new ArrayList<>();

            // Điều kiện CỐ ĐỊNH: Chỉ lấy topic loại DEFAULT
            predicates.add(criteriaBuilder.equal(root.get("type"), TypeTopic.DEFAULT));

            // Điều kiện ĐỘNG: Search Term (tìm trong name và description)
            if (searchTerm != null && !searchTerm.isBlank()) {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate descPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            // Điều kiện ĐỘNG: Lọc theo ngôn ngữ
            if (languageName != null && !languageName.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.join("language").get("name"), languageName));
            }

            if (languageId != null && languageId > 0) {
                predicates.add(criteriaBuilder.equal(root.join("language").get("id"), languageId));
            }

            // Điều kiện ĐỘNG: Lọc theo trạng thái xóa
            if (isDeleted != null) {
                predicates.add(criteriaBuilder.equal(root.get("deleteFlag"), isDeleted));
            }

            // Kết hợp tất cả các điều kiện bằng phép AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // 3. Gọi repository để lấy dữ liệu
        Page<Topic> topicPage = topicRepository.findAll(spec, pageable);

        // 4. Chuyển đổi Page<Topic> sang Page<AdminTopicResponse>
        return topicPage.map(topicMapper::toAdminResponse);
    }

    @Override
    public AdminTopicResponse createTopicForAdmin(AdminCreateTopicRequest request, MultipartFile file) {
        // 1. Kiểm tra tên topic đã tồn tại chưa
        if (topicRepository.existsByName(request.getName())) {
            throw new DataExistedException("Tên topic đã tồn tại: " + request.getName());
        }

        // 2. Tìm kiếm thực thể Language
        String languageName = request.getLanguageRequest().getName();
        Language language = languageRepository.findByName(languageName)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với tên: " + languageName));

        // 3. Chuyển đổi DTO sang Entity
        Topic topic = topicMapper.toAdminEntity(request);

        // 4. Nếu có file đính kèm, upload lên Cloudinary
        if (file != null && !file.isEmpty()) {
            try {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
                topic.setImageUrl(uploadResult.get("url"));
                topic.setImageId(uploadResult.get("public_id"));
            } catch (IOException e) {
                // Có thể ném ra một exception tùy chỉnh ở đây
                throw new RuntimeException("Lỗi khi upload ảnh", e);
            }
        }

        // 5. Thiết lập các trường còn lại
        topic.setLanguage(language);
        topic.setType(TypeTopic.DEFAULT);
        topic.setDeleteFlag(false);
        topic.setCreatedAt(LocalDateTime.now());
        topic.setUser(null);

        // 6. Lưu vào cơ sở dữ liệu
        Topic savedTopic = topicRepository.save(topic);

        // 7. Trả về response
        return topicMapper.toAdminResponse(savedTopic);
    }

    @Override
    public AdminTopicResponse updateTopicForAdmin(Integer topicId, AdminUpdateTopicRequest request, MultipartFile file) {
        // 1. Tìm topic cần cập nhật, nếu không thấy sẽ ném NotFoundException
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy topic với ID: " + topicId));

        // 2. Cập nhật các trường cơ bản nếu chúng được cung cấp trong request
        if (request.getName() != null && !request.getName().isBlank()) {
            // Kiểm tra xem tên mới có bị trùng với topic khác không
            topicRepository.findByName(request.getName()).ifPresent(existingTopic -> {
                if (!existingTopic.getId().equals(topicId)) {
                    throw new DataExistedException("Tên topic đã tồn tại: " + request.getName());
                }
            });
            topic.setName(request.getName());
        }
        if (request.getDescription() != null) {
            topic.setDescription(request.getDescription());
        }

        // 3. Cập nhật ngôn ngữ nếu được cung cấp
        if (request.getLanguageRequest() != null && request.getLanguageRequest().getId() != null) {
            String languageName = request.getLanguageRequest().getName();
            Language newLanguage = languageRepository.findByName(languageName)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy ngôn ngữ với tên: " + languageName));
            topic.setLanguage(newLanguage);
        }

        // 4. Xử lý upload ảnh mới (nếu có)
        if (file != null && !file.isEmpty()) {
            try {
                // Xóa ảnh cũ trên Cloudinary nếu tồn tại
                if (topic.getImageId() != null && !topic.getImageId().isBlank()) {
                    cloudinaryService.deleteFile(topic.getImageId());
                }

                // Upload ảnh mới và cập nhật thông tin
                Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
                topic.setImageUrl(uploadResult.get("url"));
                topic.setImageId(uploadResult.get("public_id"));
            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi cập nhật ảnh", e);
            }
        }

        // 5. Lưu lại topic đã cập nhật
        Topic updatedTopic = topicRepository.save(topic);

        // 6. Trả về response
        return topicMapper.toAdminResponse(updatedTopic);
    }

    @Override
    public void deleteTopicForAdmin(Integer topicId) {
        // 1. Tìm topic cần xóa
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy topic với ID: " + topicId));

        // 2. Đánh dấu xóa mềm
        topic.setDeleteFlag(true);

        // 3. Lưu lại
        topicRepository.save(topic);
    }

    @Override
    public AdminTopicResponse getTopicDetailsForAdmin(Integer topicId) {
        // 1. Tìm topic bằng ID, nếu không có sẽ ném lỗi NotFoundException
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy topic với ID: " + topicId));

        // 2. Dùng mapper để chuyển đổi sang DTO và trả về
        return topicMapper.toAdminResponse(topic);
    }

    @Override
    public void restoreTopicForAdmin(Integer topicId) {
        // 1. Tìm topic bằng ID
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy topic với ID: " + topicId));

        // 2. Kiểm tra xem topic có thực sự bị xóa không
        if (!topic.getDeleteFlag()) {
            // Có thể ném lỗi hoặc đơn giản là không làm gì cả
            throw new InvalidDataException("Topic này chưa bị xóa.");
        }

        // 3. Đặt lại cờ xóa
        topic.setDeleteFlag(false);

        // 4. Lưu lại thay đổi
        topicRepository.save(topic);
    }
}
