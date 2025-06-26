package com.lmh.web.repository;

import com.lmh.web.model.FlashCard;
import com.lmh.web.model.User;
import com.lmh.web.model.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface FlashCardRepository extends JpaRepository <FlashCard, Integer>{
    FlashCard findByVocabulary(Vocabulary vocabulary) ;
}
