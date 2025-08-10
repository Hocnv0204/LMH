package com.lmh.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.dto.request.vocab.CreateVocabularyRequest;
import com.lmh.web.dto.request.vocab.UpdateVocabularyRequest;
import com.lmh.web.dto.response.ApiResponse;
import com.lmh.web.service.VocabService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vocab")
@RequiredArgsConstructor
public class VocabController {
    
    private final VocabService vocabService;
    private final RestClient.Builder builder;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE )
    public ResponseEntity<ApiResponse<?>> createVocabulary(
            @RequestPart("vocab")  String request ,
            @RequestPart(value = "image" , required = false )MultipartFile image ) {
        CreateVocabularyRequest vocabularyRequest = null ;
        ObjectMapper mapper = new ObjectMapper() ;
        try{
            vocabularyRequest = mapper.readValue(request , CreateVocabularyRequest.class) ;
        }catch (Exception e){
            throw new RuntimeException("Invalid request body") ;
        }
        VocabularyDTO createdVocabulary = vocabService.createVocab(vocabularyRequest , image );
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(createdVocabulary)
                        .build()
        ) ;
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateVocabulary(@RequestBody UpdateVocabularyRequest request , @PathVariable Integer id){
        VocabularyDTO dto = vocabService.updateVocab(request , id ) ;
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(dto)
                        .build()
        ) ;
    }
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<?>>getListVocab(
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "id") String sortBy,
            @PathVariable Integer userId)
    {
        Pageable pageable = PageableUtils.createPageable(size , page , sortBy) ;
        Page<VocabularyDTO> response = vocabService.getListVocab(userId , pageable) ;
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteVocab(@PathVariable Integer id){
        vocabService.deleteVocab(id);
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data("Word is deleted")
                        .build()
        ) ;
    }
}
