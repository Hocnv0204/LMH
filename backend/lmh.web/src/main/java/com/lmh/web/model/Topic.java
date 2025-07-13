package com.lmh.web.model;

import com.lmh.web.common.TypeTopic;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "topic")
@Getter
@Setter
public class Topic {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "delete_flag")
    private Boolean deleteFlag;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TypeTopic type;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id")
    private Level level;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "language_id")
    private Language language;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Lesson> lessons;
    
    public Topic() {}
    
    @Override
    public String toString() {
        return "Topic{" +
                "createdAt=" + createdAt +
                ", note='" + note + '\'' +
                ", type='" + type + '\'' +
                ", deleteFlag=" + deleteFlag +
                ", description='" + description + '\'' +
                ", name='" + name + '\'' +
                ", id=" + id +
                '}';
    }
} 