package com.lmh.web.controller;

import com.lmh.web.dto.response.ApiError;
import com.lmh.web.dto.response.ApiResponse;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class FileUploadController {
    private final FileStorageService fileUploadService ;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE )
    public ResponseEntity<ApiResponse<?>> uploadFile(@RequestParam("file") MultipartFile file ) throws Exception{
        try{
            String result = fileUploadService.storeFile(file , "test") ;
            return ResponseEntity.ok().body(
                    ApiResponse.builder()
                            .success(true)
                            .data(result)
                            .build()
            ) ;
        }catch(IOException e){
            log.error("Failed to upload file: {}", e.getMessage(), e);
            return ResponseEntity.ok().body(
                    ApiResponse.builder()
                            .success(false)
                            .error(
                                    new ApiError(ErrorCode.WORD_EXISTS)
                            )
                            .build()
            ) ;
        }
    }
}
