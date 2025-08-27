package com.lmh.web.service.topic;

import com.lmh.web.dto.request.topic.AdminCreateTopicRequest;
import com.lmh.web.dto.request.topic.AdminUpdateTopicRequest;
import com.lmh.web.dto.response.topic.AdminTopicResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface AdminTopicService {

    Page<AdminTopicResponse> getAllTopicsForAdmin(
            String searchTerm,
            String languageName,
            Integer languageId,
            Boolean isDeleted,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    AdminTopicResponse createTopicForAdmin(AdminCreateTopicRequest request, MultipartFile file);

    AdminTopicResponse updateTopicForAdmin(Integer topicId, AdminUpdateTopicRequest request, MultipartFile file);

    void deleteTopicForAdmin(Integer topicId);

    AdminTopicResponse getTopicDetailsForAdmin(Integer topicId);

    void restoreTopicForAdmin(Integer topicId);
}