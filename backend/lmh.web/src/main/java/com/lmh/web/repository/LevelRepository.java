package com.lmh.web.repository;

import com.lmh.web.model.Level;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LevelRepository extends JpaRepository<Level, String> {
    List<Level> getLevelByLanguageNameAndDeleteFlagFalse(String languageName);
}
