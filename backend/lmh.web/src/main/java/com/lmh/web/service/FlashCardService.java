package com.lmh.web.service;

import com.lmh.web.dto.FlashCardDTO;
import com.lmh.web.model.FlashCard;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FlashCardService {
    void deleteFlashCard(Integer id ) ;
    FlashCardDTO updateFlashCard(Integer id  , MultipartFile image ) ;

}
