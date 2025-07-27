package com.lmh.web.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "language")
@Getter
@Setter
public class Language {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "delete_flag")
    private Boolean deleteFlag;

    @Column(name = "language_code", length = 10, unique = true)
    private String languageCode; // Ví dụ: "en", "ja", "zh"

    @OneToMany(mappedBy = "language", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Topic> topics;

    @OneToMany(mappedBy = "language", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Level> levels;


    public Language() {}
    
    @Override
    public String toString() {
        return "Language{" +
                "deleteFlag=" + deleteFlag +
                ", updatedAt=" + updatedAt +
                ", createdAt=" + createdAt +
                ", note='" + note + '\'' +
                ", name='" + name + '\'' +
                ", id=" + id +
                '}';
    }
} 