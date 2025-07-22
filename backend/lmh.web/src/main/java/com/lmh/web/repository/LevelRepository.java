package com.lmh.web.repository;

import com.lmh.web.model.Level;
import com.lmh.web.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface LevelRepository extends JpaRepository<Level, Integer>, JpaSpecificationExecutor<Level> {
    List<Level> getLevelByLanguageNameAndDeleteFlagFalse(String languageName);
    Optional<Level> findByName(String name);

    /**
     * Kiểm tra xem một Level có tồn tại dựa trên tên và ID ngôn ngữ.
     * Dùng để tránh tạo trùng Level trong cùng một ngôn ngữ (ví dụ: không thể có 2 Level "N5" cho Tiếng Nhật).
     */
    boolean existsByNameIgnoreCaseAndLanguageId(String name, Integer languageId);

    /**
     * Tìm một Level dựa trên tên và ID ngôn ngữ.
     */
    Optional<Level> findByNameIgnoreCaseAndLanguageId(String name, Integer languageId);
}
