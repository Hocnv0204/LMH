package com.lmh.web.repository;

import com.lmh.web.model.Level;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LevelRepository extends JpaRepository<Level, String> {
    List<Level> getLevelByLanguageNameAndDeleteFlagFalse(String languageName);
    Optional<Level> findByName(String name);
}
