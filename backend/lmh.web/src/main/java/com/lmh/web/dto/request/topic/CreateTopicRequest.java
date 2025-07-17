//package com.lmh.web.dto.request.topic;
//
//import com.lmh.web.common.TypeTopic;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import lombok.Data;
//import org.springframework.web.multipart.MultipartFile;
//
//@Data
//public class CreateTopicRequest {
//
//    @NotBlank(message = "Name is required")
//    private String name;
//
//    @NotBlank(message = "Description is required")
//    private String description;
//
//    @NotNull(message = "Language ID is required")
//    private Integer languageId;
//
//    // For Admin endpoint only
//    private TypeTopic type;
//
//    // For Admin endpoint only
//    private String note;
//
//    // Optional image upload
//    private MultipartFile image;
//}