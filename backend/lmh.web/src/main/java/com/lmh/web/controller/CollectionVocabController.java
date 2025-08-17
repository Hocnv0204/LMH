package com.lmh.web.controller;

import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.CollectionVocabDTO;
import com.lmh.web.dto.request.collection.CreateCollectionRequest;
import com.lmh.web.dto.request.collection.UpdateCollectionRequest;
import com.lmh.web.dto.response.ApiResponse;
import com.lmh.web.service.CollectionVocabService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collection")
@RequiredArgsConstructor
public class CollectionVocabController {
    

    private final  CollectionVocabService collectionVocabService;
    
    // GET: Lấy tất cả collections
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllCollection(){
        List<CollectionVocabDTO> response = collectionVocabService.findAll() ;
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .data(response)
                        .success(true)
                        .build()
        ) ;
    }
    // GET: Lấy collection theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getCollectionById(@PathVariable Integer id) {
       CollectionVocabDTO response = collectionVocabService.findById(id) ;
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .data(response)
                        .success(true)
                        .build()
        ) ;
    }
    @GetMapping("/user/{id}")
    public ResponseEntity<ApiResponse<?>> getCollectionByUserId(@PathVariable Integer id ,
                                                                @RequestParam(defaultValue = "10") int size,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "id") String sortBy
    ){
        Pageable pageable = PageableUtils.createPageable(size , page , sortBy) ;
        Page<CollectionVocabDTO> response = collectionVocabService.findByUserId(id , pageable) ;
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .data(response)
                        .success(true)
                        .build()
        ) ;
    }
    // POST: Tạo collection mới
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createCollection(@RequestBody CreateCollectionRequest request) {
        CollectionVocabDTO response = collectionVocabService.createCollection(request) ;
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .data(response)
                        .success(true)
                        .build()
        ) ;
    }
    
    // PUT: Cập nhật collection
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateCollection(@PathVariable Integer id, @RequestBody UpdateCollectionRequest request) {
        CollectionVocabDTO response = collectionVocabService.update(id , request) ;
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .data(response)
                        .success(true)
                        .build()
        ) ;
    }
    
    // DELETE: Xóa collection
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteCollection(@PathVariable Integer id) {
        collectionVocabService.deleteById(id);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .data("Delete collection successful")
                        .success(true)
                        .build()
        ) ;
    }
    
    // GET: Kiểm tra collection có tồn tại không
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> checkCollectionExists(@PathVariable Integer id) {
        try {
            boolean exists = collectionVocabService.existsById(id);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}