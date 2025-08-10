package com.lmh.web.service.impl;

import com.lmh.web.dto.DictionaryApiResponse;
import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.dto.request.vocab.CreateVocabularyRequest;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

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
        // Gọi API dictionary để lấy thông tin từ
        if(request.getCollectionId() == null){
            throw new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS) ;
        }
        DictionaryApiResponse[] apiResponse = callDictionaryApi(request.getTerm());
        
        if (apiResponse == null || apiResponse.length == 0) {
            throw new AppException(ErrorCode.WORD_INVALID) ;
        }
        
        DictionaryApiResponse wordInfo = apiResponse[0];
        
        // Tạo entity Vocabulary
        Vocabulary vocabulary = new Vocabulary();
        vocabulary.setTerm(request.getTerm());
        vocabulary.setVi(request.getVi());
        // Kiểm tra từ mới đã tồn tại chưa
        String audioUrl = null;
        
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
            try {
                imageUrl = fileStorageService.storeFile(image, "flash_card");
            }catch(Exception e){
                throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED) ;
            }
        }
        Vocabulary savedVocabulary = vocabularyRepository.save(vocabulary);
        FlashCard flashCard = FlashCard.builder()
                .imageUrl(imageUrl)
                .vocabulary(savedVocabulary)
                .build();
        flashCardRepository.save(flashCard) ;
        
        // Convert sang DTO và trả về
        return vocabMapper.toDto(savedVocabulary);
    }
    
    private DictionaryApiResponse[] callDictionaryApi(String word) {
        try {
            String url = DICTIONARY_API_URL + word;
            ResponseEntity<DictionaryApiResponse[]> response = restTemplate.getForEntity(url, DictionaryApiResponse[].class);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            String responseBody = e.getResponseBodyAsString() ;
            if(responseBody != null && responseBody.contains("No Definitions Found")){
                throw new AppException(ErrorCode.WORD_INVALID) ;
            }
            // Xử lý exception của thêm từ mới
            throw new AppException(ErrorCode.WORD_INVALID) ;
        }
    }

    @Override
    public VocabularyDTO updateVocab(UpdateVocabularyRequest request , Integer id){
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORD_IS_NOT_EXISTS));
        CollectionVoca collectionVocab = collectionVocaRepository.findById(request.getCollectionId())
                .orElseThrow(
                        () -> new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS)
                ) ;
        vocabulary.setType(request.getType());
        vocabulary.setVi(request.getVi());
        vocabulary.setExample(request.getExample());
        vocabulary.setCollection(collectionVocab);
        Vocabulary savedVocabulary = vocabularyRepository.save(vocabulary) ;
        FlashCard card = flashCardRepository.findByVocabulary(savedVocabulary) ;
        card.setVocabulary(savedVocabulary);
        flashCardRepository.save(card) ;
        return vocabMapper.toDto(savedVocabulary) ;
    }

    @Override
    public void deleteVocab(Integer id){
        Vocabulary vocabulary = vocabularyRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.WORD_IS_NOT_EXISTS)
        ) ;
        FlashCard card = flashCardRepository.findByVocabulary(vocabulary) ;
        flashCardRepository.delete(card);
        vocabularyRepository.delete(vocabulary);
    }
    @Override
    public VocabularyDTO getVocab(Integer id){
        Vocabulary vocabulary = vocabularyRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.WORD_IS_NOT_EXISTS)
        ) ;
        return vocabMapper.toDto(vocabulary) ;
    }

    @Override
    public Page<VocabularyDTO> getListVocab(Integer userId , Pageable pageable){
        Page<Vocabulary> vocabularies = vocabularyRepository.findByUserId(userId , pageable);
        Page<VocabularyDTO> vocabularyDTOS = vocabularies.map(vocabMapper ::toDto) ;
        return vocabularyDTOS ;
    }
}
