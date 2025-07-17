package com.lmh.web.model;

import jakarta.persistence.*;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "collectionvoca")
@Getter
@Setter
public class CollectionVoca {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 100)
    private String name;
    
    @OneToMany(mappedBy = "collection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vocabulary> vocabularies;
    
    public CollectionVoca() {}
    
    
    @Override
    public String toString() {
        return "CollectionVoca{" +
                "name='" + name + '\'' +
                ", id=" + id +
                '}';
    }
} 