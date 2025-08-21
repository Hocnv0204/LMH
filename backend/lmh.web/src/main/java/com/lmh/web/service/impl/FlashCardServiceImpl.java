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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlashCardServiceImpl implements FlashCardService {
    private final FlashCardRepository flashCardRepository;
    private final FileStorageService fileStorageService;
    private final FlashCardMapper flashCardMapper ;

    @Override
    public void deleteFlashCard(Integer id) {
        log.info("Bắt đầu xóa flashcard ID: {}", id);
        FlashCard flashCard = flashCardRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Xóa flashcard thất bại: Không tìm thấy flashcard với ID: {}", id);
                    return new AppException(ErrorCode.FLASHCARD_NOT_FOUND);
                }
        );
        String imageUrl = flashCard.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            log.debug("Xóa hình ảnh flashcard: {}", imageUrl);
            try {
                fileStorageService.deleteFile(imageUrl, "flash_card");
                log.debug("Xóa hình ảnh flashcard thành công: {}", imageUrl);
            } catch (Exception e) {
                log.error("Xóa hình ảnh flashcard thất bại: {}", imageUrl, e);
                throw new AppException(ErrorCode.DELETE_FAILED);
            }
        }
        flashCardRepository.delete(flashCard);
        log.info("Xóa flashcard thành công ID: {}", id);
    }
    
    @Override
    public FlashCardDTO updateFlashCard(Integer id , MultipartFile image ){
        log.info("Bắt đầu cập nhật flashcard ID: {}", id);
        FlashCard flashCard = flashCardRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Cập nhật flashcard thất bại: Không tìm thấy flashcard với ID: {}", id);
                    return new AppException(ErrorCode.FLASHCARD_NOT_FOUND);
                }
        ) ;
        String oldImageUrl = flashCard.getImageUrl() ;
        if(oldImageUrl != null && !oldImageUrl.isEmpty()){
            log.debug("Xóa hình ảnh cũ của flashcard: {}", oldImageUrl);
            try {
                fileStorageService.deleteFile(oldImageUrl, "flash_card");
                log.debug("Xóa hình ảnh cũ thành công: {}", oldImageUrl);
            }catch(Exception e){
                log.error("Xóa hình ảnh cũ thất bại: {}", oldImageUrl, e);
                throw new AppException(ErrorCode.DELETE_FAILED);
            }
        }
        String newImageUrl = null  ;
        if(image != null && !image.isEmpty()){
            log.debug("Upload hình ảnh mới cho flashcard ID: {}", id);
            try {
                newImageUrl = fileStorageService.storeFile(image, "flash_card");
                log.debug("Upload hình ảnh mới thành công: {}", newImageUrl);
            }catch(Exception e){
                log.error("Upload hình ảnh mới thất bại cho flashcard ID: {}", id, e);
                throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED) ;
            }
        }
        flashCard.setImageUrl(newImageUrl);
        FlashCardDTO result = flashCardMapper.toDto(flashCardRepository.save(flashCard));
        log.info("Cập nhật flashcard thành công ID: {}", id);
        return result;
    }
}
