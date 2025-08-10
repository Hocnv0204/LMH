//package com.lmh.web.model;
//
//import jakarta.persistence.*;
//import java.util.List;
//
//import lombok.*;
//
//@Entity
//@Table(name = "collectionvocab")
//@Getter
//@Setter
//@Builder
//@AllArgsConstructor
//public class CollectionVocab {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Integer id;
//
//    @Column(length = 100)
//    private String name;
//
//    @OneToMany(mappedBy = "collection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<Vocabulary> vocabularies;
//
//    public CollectionVocab() {}
//
//
//    @Override
//    public String toString() {
//        return "CollectionVoca{" +
//                "name='" + name + '\'' +
//                ", id=" + id +
//                '}';
//    }
//}