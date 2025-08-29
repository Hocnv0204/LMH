package com.lmh.web.service.impl;

import com.lmh.web.dto.DictionaryApiResponse;
import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.dto.request.vocab.CreateVocabularyRequest;
import com.lmh.web.dto.request.vocab.GetListVocabRequest;
import com.lmh.web.dto.request.vocab.UpdateVocabularyRequest;
import com.lmh.web.exception.AppException;
import com.lmh.web.mapper.VocabMapper;
import com.lmh.web.model.CollectionVoca;

import com.lmh.web.model.FlashCard;
import com.lmh.web.model.Vocabulary;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.repository.CollectionVocaRepository;
import com.lmh.web.repository.FlashCardRepository;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.repository.VocabularyRepository;
import com.lmh.web.service.FileStorageService;
import com.lmh.web.service.VocabService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VocabServiceImpl implements VocabService {
    
    private final VocabularyRepository vocabularyRepository;
    private final CollectionVocaRepository collectionVocaRepository ;
    private final UserRepository userRepository;
    private final VocabMapper vocabMapper ;
    private final FileStorageService fileStorageService ;
    private final FlashCardRepository flashCardRepository ;
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

    @Override
    public VocabularyDTO createVocab(CreateVocabularyRequest request , MultipartFile image) {
        log.info("Bắt đầu tạo từ vựng mới: {} cho collection ID: {}", request.getTerm(), request.getCollectionId());
        
        // Gọi API dictionary để lấy thông tin từ
        if(request.getCollectionId() == null){
            log.warn("Tạo từ vựng thất bại: Collection ID không được cung cấp");
            throw new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS) ;
        }
        if(!collectionVocaRepository.existsByIdAndUserId(request.getCollectionId() , request.getUserId())){
            log.warn("Tạo từ vựng thất bại: Collection ID {} không thuộc về user ID {}", request.getCollectionId(), request.getUserId());
            throw new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS) ;
        }
        
        log.debug("Gọi Dictionary API cho từ: {}", request.getTerm());
        DictionaryApiResponse[] apiResponse = callDictionaryApi(request.getTerm());
        boolean isInvalid = (apiResponse == null || apiResponse.length == 0 ) ;
        if (isInvalid && !request.isForceAdd()) {
            log.warn("Từ vựng không hợp lệ: {} và không bắt buộc thêm", request.getTerm());
            throw new AppException(ErrorCode.WORD_INVALID) ;
        }
        

        // Tạo entity Vocabulary
        Vocabulary vocabulary = new Vocabulary();
        vocabulary.setTerm(request.getTerm());
        vocabulary.setVi(request.getVi());
        // Kiểm tra từ mới đã tồn tại chưa
        String audioUrl = null;
        if(!isInvalid) {
            log.debug("Xử lý thông tin từ Dictionary API cho từ: {}", request.getTerm());
            DictionaryApiResponse wordInfo = apiResponse[0];

            // Lấy thông tin từ API response
            if (wordInfo.getMeanings() != null && !wordInfo.getMeanings().isEmpty()) {
                DictionaryApiResponse.Meaning firstMeaning = wordInfo.getMeanings().get(0);
                vocabulary.setType(firstMeaning.getPartOfSpeech());

                // Lấy ví dụ từ definition đầu tiên
                if (firstMeaning.getDefinitions() != null && !firstMeaning.getDefinitions().isEmpty()) {
                    DictionaryApiResponse.Definition firstDefinition = firstMeaning.getDefinitions().get(0);
                    vocabulary.setExample(firstDefinition.getExample());
                }
            }

            // Lấy phát âm và audio URL
            if (wordInfo.getPhonetics() != null && !wordInfo.getPhonetics().isEmpty()) {
                // Tìm phonetic có audio
                Optional<DictionaryApiResponse.Phonetic> phoneticWithAudio = wordInfo.getPhonetics().stream()
                        .filter(p -> p.getAudio() != null && !p.getAudio().isEmpty())
                        .findFirst();

                if (phoneticWithAudio.isPresent()) {
                    vocabulary.setPronunciation(phoneticWithAudio.get().getText());
                    audioUrl = phoneticWithAudio.get().getAudio();
                } else if (wordInfo.getPhonetic() != null) {
                    vocabulary.setPronunciation(wordInfo.getPhonetic());
                }
            } else if (wordInfo.getPhonetic() != null) {
                vocabulary.setPronunciation(wordInfo.getPhonetic());
            }
        }
        
        // Set collection và user
        if (request.getCollectionId() != null) {
            vocabulary.setCollection(collectionVocaRepository.findById(request.getCollectionId()).orElseThrow(
                    () -> new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS)
            ));
        }
        if (request.getUserId() != null) {
            vocabulary.setUser(userRepository.findById(request.getUserId()).orElse(null));
        }
        vocabulary.setAudioUrl(audioUrl);
        String imageUrl = null ;
        if(image != null && !image.isEmpty()){
            log.debug("Upload hình ảnh cho từ vựng: {}", request.getTerm());
            try {
                imageUrl = fileStorageService.storeFile(image, "flash_card");
                log.debug("Upload hình ảnh thành công: {}", imageUrl);
            }catch(Exception e){
                log.error("Upload hình ảnh thất bại cho từ vựng: {}", request.getTerm(), e);
                throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED) ;
            }
        }
        vocabulary.setImageUrl(imageUrl);
        vocabulary.setCreatedAt(LocalDateTime.now());
        Vocabulary savedVocabulary = vocabularyRepository.save(vocabulary);
        FlashCard flashCard = FlashCard.builder()
                .imageUrl(imageUrl)
                .vocabulary(savedVocabulary)
                .build();
        flashCardRepository.save(flashCard) ;
        
        log.info("Tạo từ vựng thành công: {}, ID: {}", request.getTerm(), savedVocabulary.getId());
        
        // Convert sang DTO và trả về
        return vocabMapper.toDto(savedVocabulary);
    }
    
    private DictionaryApiResponse[] callDictionaryApi(String word) {
        try {
            String url = DICTIONARY_API_URL + word;
            log.debug("Gọi Dictionary API: {}", url);
            ResponseEntity<DictionaryApiResponse[]> response = restTemplate.getForEntity(url, DictionaryApiResponse[].class);
            log.debug("Gọi Dictionary API thành công cho từ: {}", word);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            String responseBody = e.getResponseBodyAsString() ;
            log.debug("Dictionary API không tìm thấy định nghĩa cho từ: {}", word);
            if (responseBody != null && responseBody.contains("No Definitions Found")) {
                return null;
            }
            return null;
        } catch (Exception e) {
            log.warn("Lỗi khi gọi Dictionary API cho từ: {}", word, e);
            return null;
        }
    }

    @Override
    public VocabularyDTO updateVocab(UpdateVocabularyRequest request , Integer id , MultipartFile image ) throws Exception {
        log.info("Bắt đầu cập nhật từ vựng ID: {}", id);
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Cập nhật từ vựng thất bại: Không tìm thấy từ vựng với ID: {}", id);
                    return new AppException(ErrorCode.WORD_IS_NOT_EXISTS);
                });
        CollectionVoca collectionVocab = collectionVocaRepository.findById(request.getCollectionId())
                .orElseThrow(
                        () -> {
                            log.warn("Cập nhật từ vựng thất bại: Không tìm thấy collection với ID: {}", request.getCollectionId());
                            return new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS);
                        }
                ) ;
        String oldTerm = vocabulary.getTerm();
        vocabulary.setType(request.getType());
        vocabulary.setVi(request.getVi());
        vocabulary.setExample(request.getExample());
        vocabulary.setCollection(collectionVocab);
        // Update image if provided
        if (image != null && !image.isEmpty()) {
            log.debug("Cập nhật hình ảnh cho từ vựng ID: {}", id);
            // Delete old image
            String oldImageUrl = vocabulary.getImageUrl();
            if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
                fileStorageService.deleteFile(oldImageUrl, "flash_card");
            }

            // Store new image
            String newImageUrl = fileStorageService.storeFile(image, "flash_card");
            vocabulary.setImageUrl(newImageUrl);
            log.debug("Cập nhật hình ảnh thành công: {}", newImageUrl);
        }
        Vocabulary savedVocabulary = vocabularyRepository.save(vocabulary) ;
        FlashCard card = flashCardRepository.findByVocabulary(savedVocabulary) ;
        card.setVocabulary(savedVocabulary);
        flashCardRepository.save(card) ;
        log.info("Cập nhật từ vựng thành công ID: {}, từ cũ: {} -> từ mới: {}", id, oldTerm, savedVocabulary.getTerm());
        return vocabMapper.toDto(savedVocabulary) ;
    }

    @Override
    public void deleteVocab(Integer id){
        log.info("Bắt đầu xóa từ vựng ID: {}", id);
        Vocabulary vocabulary = vocabularyRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Xóa từ vựng thất bại: Không tìm thấy từ vựng với ID: {}", id);
                    return new AppException(ErrorCode.WORD_IS_NOT_EXISTS);
                }
        ) ;
        String term = vocabulary.getTerm();
        FlashCard card = flashCardRepository.findByVocabulary(vocabulary) ;
        flashCardRepository.delete(card);
        vocabularyRepository.delete(vocabulary);
        log.info("Xóa từ vựng thành công ID: {}, từ: {}", id, term);
    }
    
    @Override
    public VocabularyDTO getVocab(Integer id){
        log.info("Lấy thông tin từ vựng ID: {}", id);
        Vocabulary vocabulary = vocabularyRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Không tìm thấy từ vựng với ID: {}", id);
                    return new AppException(ErrorCode.WORD_IS_NOT_EXISTS);
                }
        ) ;
        log.info("Lấy thông tin từ vựng thành công ID: {}, từ: {}", id, vocabulary.getTerm());
        return vocabMapper.toDto(vocabulary) ;
    }

    @Override
    public Page<VocabularyDTO> getListVocab(Integer userId , Pageable pageable){
        log.info("Lấy danh sách từ vựng cho user ID: {}", userId);
        Page<Vocabulary> vocabularies = vocabularyRepository.findByUserId(userId , pageable);
        Page<VocabularyDTO> vocabularyDTOS = vocabularies.map(vocabMapper ::toDto) ;
        log.info("Lấy danh sách từ vựng thành công: {} từ vựng cho user ID: {}", vocabularyDTOS.getTotalElements(), userId);
        return vocabularyDTOS ;
    }

    @Override
    public List<VocabularyDTO> findByCollection(Integer collectionId){
        log.info("Lấy danh sách từ vựng theo collection ID: {}", collectionId);
        List<Vocabulary> vocabularies = vocabularyRepository.findByCollectionId(collectionId) ;
        List<VocabularyDTO> vocabularyDTOS = vocabularies.stream().map(vocabMapper ::toDto).collect(Collectors.toList()) ;
        log.info("Lấy danh sách từ vựng theo collection thành công: {} từ vựng cho collection ID: {}", vocabularyDTOS.size(), collectionId);
        return vocabularyDTOS ;
    }
}
