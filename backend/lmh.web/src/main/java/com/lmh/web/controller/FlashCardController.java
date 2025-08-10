package com.lmh.web.controller;

import com.lmh.web.dto.FlashCardDTO;
import com.lmh.web.dto.response.ApiResponse;
import com.lmh.web.service.FlashCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/apis/flash_card")
@RequiredArgsConstructor
public class FlashCardController {
    private final FlashCardService flashCardService ;

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteFlashCard(@PathVariable Integer id){
        flashCardService.deleteFlashCard(id);
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data("Flash Card is deleted")
                        .build()
        ) ;
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE , path = ("/{id}"))
    public ResponseEntity<ApiResponse<?>> updateFlashCard(
            @RequestPart (value = "image" , required = false) MultipartFile image ,
            @PathVariable Integer id
            ){
        FlashCardDTO dto = flashCardService.updateFlashCard(id , image) ;
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(dto)
                        .build()
        ) ;
    }

}
