package com.lmh.web.controller.topic;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lmh.web.dto.request.topic.AdminCreateTopicRequest;
import com.lmh.web.dto.request.topic.AdminUpdateTopicRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.topic.AdminTopicResponse;
import com.lmh.web.service.topic.AdminTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/topics")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminTopicController {

    private final AdminTopicService adminTopicService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public CustomResponse<Page<AdminTopicResponse>> getAllTopics(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String languageName,
            @RequestParam(required = false) Integer languageId,
            @RequestParam(required = false) Boolean isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Page<AdminTopicResponse> topicPage = adminTopicService.getAllTopicsForAdmin(
                searchTerm, languageName, languageId, isDeleted, page, size, sortBy, sortDir
        );
        return new CustomResponse<>(topicPage, HttpStatus.OK);
    }

    @GetMapping("/{topicId}")
    public CustomResponse<AdminTopicResponse> getTopicDetails(@PathVariable Integer topicId) {
        AdminTopicResponse topicDetails = adminTopicService.getTopicDetailsForAdmin(topicId);
        return new CustomResponse<>(topicDetails, HttpStatus.OK);
    }

    @PostMapping
    public CustomResponse<AdminTopicResponse> createTopic(
            @RequestParam("request") String requestJson,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws JsonProcessingException {
        // Do request là multipart/form-data, dữ liệu JSON sẽ được gửi dưới dạng chuỗi
        // Chúng ta cần chuyển đổi chuỗi JSON này thành đối tượng AdminCreateTopicRequest
        AdminCreateTopicRequest request = objectMapper.readValue(requestJson, AdminCreateTopicRequest.class);

        AdminTopicResponse newTopic = adminTopicService.createTopicForAdmin(request, file);
        return new CustomResponse<>(newTopic, HttpStatus.CREATED);
    }

    @PutMapping("/{topicId}")
    public CustomResponse<AdminTopicResponse> updateTopic(
            @PathVariable Integer topicId,
            @RequestParam("request") String requestJson,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws JsonProcessingException {
        AdminUpdateTopicRequest request = objectMapper.readValue(requestJson, AdminUpdateTopicRequest.class);
        AdminTopicResponse updatedTopic = adminTopicService.updateTopicForAdmin(topicId, request, file);
        return new CustomResponse<>(updatedTopic, HttpStatus.OK);
    }

    @DeleteMapping("/{topicId}")
    public CustomResponse<String> deleteTopic(@PathVariable Integer topicId) {
        adminTopicService.deleteTopicForAdmin(topicId);
        // Trả về một thông báo thành công
        return new CustomResponse<>("Xóa topic thành công", HttpStatus.OK);
    }

    @PostMapping("/{topicId}/restore")
    public CustomResponse<String> restoreTopic(@PathVariable Integer topicId) {
        adminTopicService.restoreTopicForAdmin(topicId);
        return new CustomResponse<>("Khôi phục topic thành công", HttpStatus.OK);
    }
}