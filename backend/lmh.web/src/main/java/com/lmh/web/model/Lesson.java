package com.lmh.web.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lesson")
@Getter
@Setter
public class Lesson {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String paragraph;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 50)
    private String status;
    
    @Column(name = "delete_flag")
    private Boolean deleteFlag;
    
    @Column(length = 50)
    private String type;
    
    @Column(name = "last_practice")
    private LocalDateTime lastPractice;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SuggestVocabulary> suggestVocabularies;
    
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<History> histories;
    
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StatusLessonUser> statusLessonUsers;
    
    public Lesson() {}
    
    
    @Override
    public String toString() {
        return "Lesson{" +
                "updatedAt=" + updatedAt +
                ", createdAt=" + createdAt +
                ", lastPractice=" + lastPractice +
                ", type='" + type + '\'' +
                ", deleteFlag=" + deleteFlag +
                ", status='" + status + '\'' +
                ", description='" + description + '\'' +
                ", note='" + note + '\'' +
                ", paragraph='" + paragraph + '\'' +
                ", name='" + name + '\'' +
                ", id=" + id +
                '}';
    }
} 