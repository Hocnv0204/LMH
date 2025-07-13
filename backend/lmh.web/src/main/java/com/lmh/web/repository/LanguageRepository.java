package com.lmh.web.repository;

import com.lmh.web.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LanguageRepository extends JpaRepository<Language, String> {
    Optional<Language> findByName(String name);
}
