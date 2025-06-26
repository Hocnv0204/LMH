package com.lmh.web.service.impl;

import com.cloudinary.Cloudinary;
import com.lmh.web.dto.FlashCardDTO;
import com.lmh.web.exception.AppException;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.mapper.FlashCardMapper;
import com.lmh.web.model.FlashCard;
import com.lmh.web.repository.FlashCardRepository;
import com.lmh.web.service.FileStorageService;
import com.lmh.web.service.FlashCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FlashCardServiceImpl implements FlashCardService {
    private final FlashCardRepository flashCardRepository;
    private final FileStorageService fileStorageService;
    private final FlashCardMapper flashCardMapper ;

    @Override
    public void deleteFlashCard(Integer id) {
        FlashCard flashCard = flashCardRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.FLASHCARD_NOT_FOUND)
        );
        String imageUrl = flashCard.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            try {
                fileStorageService.deleteFile(imageUrl, "flash_card");
            } catch (Exception e) {
                throw new AppException(ErrorCode.DELETE_FAILED);
            }
        }
        flashCardRepository.delete(flashCard);
    }
    @Override
    public FlashCardDTO updateFlashCard(Integer id , MultipartFile image ){
        FlashCard flashCard = flashCardRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.FLASHCARD_NOT_FOUND)
        ) ;
        String oldImageUrl = flashCard.getImageUrl() ;
        if(oldImageUrl != null && !oldImageUrl.isEmpty()){
            try {
                fileStorageService.deleteFile(oldImageUrl, "flash_card");
            }catch(Exception e){
                throw new AppException(ErrorCode.DELETE_FAILED);
            }
        }
        String newImageUrl = null  ;
        if(image != null && !image.isEmpty()){
            try {
                newImageUrl = fileStorageService.storeFile(image, "flash_card");
            }catch(Exception e){
                throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED) ;
            }
        }
        flashCard.setImageUrl(newImageUrl);
        return flashCardMapper.toDto(flashCardRepository.save(flashCard)) ;
    }
}
